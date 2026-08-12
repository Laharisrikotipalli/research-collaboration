import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import verify_connectivity, close_driver
from app.routes import authors, papers, topics, graph

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="Research Collaboration Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(authors.router)
app.include_router(papers.router)
app.include_router(topics.router)
app.include_router(graph.router)


@app.on_event("startup")
def on_startup():
    # Fail loudly and early if CognoDB isn't reachable, rather than
    # letting the first user request surface a confusing error.
    try:
        settings.validate()
        if not verify_connectivity():
            logger.warning("CognoDB is not reachable at startup. The API will return 503s until it is.")
    except RuntimeError as exc:
        logger.warning(str(exc))


@app.on_event("shutdown")
def on_shutdown():
    close_driver()


@app.get("/api/health")
def health():
    ok = verify_connectivity()
    return {"status": "ok" if ok else "database_unreachable"}
