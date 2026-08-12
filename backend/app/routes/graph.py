from fastapi import APIRouter, HTTPException, Query

from app.db import run_query, DatabaseUnavailableError
from app.queries import authors as q

router = APIRouter(prefix="/api/graph", tags=["graph"])


@router.get("/collaboration-path")
def collaboration_path(
    author_a: str = Query(..., description="Source author id"),
    author_b: str = Query(..., description="Target author id"),
):
    """
    Shortest path of co-authorship connecting two researchers, e.g.
    Author A -> Paper -> Author C -> Paper -> Author B.
    This is the assignment's required 2+ hop traversal demo.
    """
    if author_a == author_b:
        raise HTTPException(status_code=400, detail="Choose two different authors.")
    try:
        rows = run_query(q.SHORTEST_COLLABORATION_PATH, {"author_a": author_a, "author_b": author_b})
        if not rows:
            return {"connected": False, "nodes": [], "hops": None}
        return {"connected": True, "nodes": rows[0]["nodes"], "hops": rows[0]["hops"]}
    except DatabaseUnavailableError:
        raise HTTPException(status_code=503, detail="Database unavailable. Please try again shortly.")
