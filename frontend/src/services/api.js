const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 503) {
    throw new ApiError("The database is temporarily unreachable. Please try again shortly.", 503);
  }
  if (res.status === 404) {
    throw new ApiError("Not found.", 404);
  }
  if (!res.ok) {
    throw new ApiError("Something went wrong on our end.", res.status);
  }
  return res.json();
}

export const api = {
  searchAuthors: (name) => request(`/api/authors?name=${encodeURIComponent(name)}`),
  getAuthor: (id) => request(`/api/authors/${encodeURIComponent(id)}`),
  getAuthorNetwork: (id) => request(`/api/authors/${encodeURIComponent(id)}/network`),
  getPotentialCollaborators: (id) =>
    request(`/api/authors/${encodeURIComponent(id)}/potential-collaborators`),

  searchPapers: (title) => request(`/api/papers?title=${encodeURIComponent(title)}`),
  getPaper: (id) => request(`/api/papers/${encodeURIComponent(id)}`),
  getCitations: (id) => request(`/api/papers/${encodeURIComponent(id)}/citations`),
  getCitationNeighborhood: (id) => request(`/api/papers/${encodeURIComponent(id)}/neighborhood`),

  getStats: () => request(`/api/stats`),

  listTopics: () => request(`/api/topics`),
  getTopic: (id) => request(`/api/topics/${encodeURIComponent(id)}`),

  getCollaborationPath: (authorA, authorB) =>
    request(
      `/api/graph/collaboration-path?author_a=${encodeURIComponent(authorA)}&author_b=${encodeURIComponent(authorB)}`
    ),

  health: () => request(`/api/health`),
};

export { ApiError };
