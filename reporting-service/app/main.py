from fastapi import FastAPI, Request, Response
from app.routes import router
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reporting Service")

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP Request Latency',
    ['method', 'endpoint']
)

REPORT_GENERATION_TIME = Histogram(
    'report_generation_seconds',
    'Time taken to generate reports',
    ['report_type']
)

# Include the router
app.include_router(router)

@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    """Middleware to monitor HTTP requests."""
    start_time = time.time()
    
    # Get the endpoint path
    endpoint = request.url.path
    logger.info(f"Processing request: {request.method} {endpoint}")
    
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        status_code = 500
        raise e
    finally:
        # Record request count
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=endpoint,
            status=status_code
        ).inc()
        
        # Record request latency
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(time.time() - start_time)
    
    return response

@app.get("/metrics")
async def metrics():
    """Expose Prometheus metrics."""
    try:
        logger.info("Generating metrics")
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )
    except Exception as e:
        logger.error(f"Error generating metrics: {str(e)}")
        raise
