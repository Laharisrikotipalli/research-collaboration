from fastapi import APIRouter, HTTPException

from app.db import run_query, DatabaseUnavailableError
from app.queries import topics as q

router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.get("")
def list_topics():
    try:
        return run_query(q.LIST_TOPICS)
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{topic_id}")
def get_topic(topic_id: str):
    try:
        papers = run_query(q.GET_TOPIC_PAPERS, {"topic_id": topic_id})
        authors = run_query(q.GET_TOPIC_AUTHORS, {"topic_id": topic_id})
        related = run_query(q.RELATED_TOPICS, {"topic_id": topic_id})
        return {"papers": papers, "authors": authors, "related_topics": related}
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")
