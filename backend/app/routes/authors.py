from fastapi import APIRouter, HTTPException, Query

from app.db import run_query, DatabaseUnavailableError
from app.queries import authors as q

router = APIRouter(prefix="/api/authors", tags=["authors"])


@router.get("")
def search_authors(name: str = Query(..., min_length=1)):
    try:
        return run_query(q.SEARCH_AUTHORS, {"name": name})
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{author_id}")
def get_author(author_id: str):
    try:
        rows = run_query(q.GET_AUTHOR, {"author_id": author_id})
        if not rows:
            raise HTTPException(status_code=404, detail="Author not found")
        return rows[0]
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{author_id}/network")
def get_author_network(author_id: str):
    """Returns the author's papers, co-authors, and topics in one call."""
    try:
        papers = run_query(q.GET_AUTHOR_PAPERS, {"author_id": author_id})
        co_authors = run_query(q.GET_CO_AUTHORS, {"author_id": author_id})
        topics = run_query(q.GET_AUTHOR_TOPICS, {"author_id": author_id})
        return {"papers": papers, "co_authors": co_authors, "topics": topics}
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{author_id}/potential-collaborators")
def get_potential_collaborators(author_id: str):
    """Authors who share a topic but have never co-authored with this author."""
    try:
        return run_query(q.POTENTIAL_COLLABORATORS, {"author_id": author_id})
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")
