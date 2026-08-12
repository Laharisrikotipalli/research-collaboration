from fastapi import APIRouter, HTTPException, Query

from app.db import run_query, DatabaseUnavailableError
from app.queries import papers as q

router = APIRouter(prefix="/api/papers", tags=["papers"])


@router.get("")
def search_papers(title: str = Query(..., min_length=1)):
    try:
        return run_query(q.SEARCH_PAPERS, {"title": title})
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{paper_id}")
def get_paper(paper_id: str):
    try:
        rows = run_query(q.GET_PAPER, {"paper_id": paper_id})
        if not rows or rows[0]["id"] is None:
            raise HTTPException(status_code=404, detail="Paper not found")
        return rows[0]
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{paper_id}/citations")
def get_citations(paper_id: str):
    try:
        return {
            "cites": run_query(q.GET_CITATIONS_OUT, {"paper_id": paper_id}),
            "cited_by": run_query(q.GET_CITATIONS_IN, {"paper_id": paper_id}),
        }
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")


@router.get("/{paper_id}/neighborhood")
def get_citation_neighborhood(paper_id: str):
    """2-hop citation neighborhood, used by the Citation Explorer view."""
    try:
        return run_query(q.CITATION_NEIGHBORHOOD, {"paper_id": paper_id})
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")
