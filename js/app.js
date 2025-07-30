const API_BASE_URL = "http://localhost:8000/api";

const projectList = document.getElementById("projectList");
const addProjectBtn = document.getElementById("addProjectBtn");
const rightPanel = document.getElementById("rightPanel");
const formContainer = document.getElementById("formContainer");
const initialView = document.getElementById("initialView");
const formTitle = document.getElementById("formTitle");
const projectTaskForm = document.getElementById("projectTaskForm");
const entityTypeInput = document.getElementById("entityType");
const entityIdInput = document.getElementById("entityId");
const currentProjectIdInput = document.getElementById("currentProjectId");
const projectNameInput = document.getElementById("projectName");
const taskNameInput = document.getElementById("taskName");
const taskStatusInput = document.getElementById("taskStatus");
const taskWeightInput = document.getElementById("taskWeight");
const projectFieldGroup = document.getElementById("projectFieldGroup");
const taskFieldGroup = document.getElementById("taskFieldGroup");
const deleteBtn = document.getElementById("deleteBtn");
const saveBtn = document.getElementById("saveBtn");
const hideFormBtn = document.getElementById("hideFormBtn");

let currentProjects = []; // Store current projects data

// --- Utility Functions ---

function showForm() {
  initialView.classList.add("hidden");
  formContainer.classList.add("active");
}

function hideForm() {
  formContainer.classList.remove("active");
  initialView.classList.remove("hidden");
  // Clear form after hiding
  projectTaskForm.reset();
  entityTypeInput.value = "";
  entityIdInput.value = "";
  currentProjectIdInput.value = "";
  deleteBtn.style.display = "none"; // Hide delete button by default
  // Reset display for field groups
  projectFieldGroup.style.display = "none";
  taskFieldGroup.style.display = "none";
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Draft":
      return "badge-secondary badge-draft";
    case "In Progress":
      return "badge-primary badge-in-progress";
    case "Done":
      return "badge-success badge-done";
    default:
      return "badge-secondary";
  }
}

// --- API Calls ---

async function fetchProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error("Failed to fetch projects");
    currentProjects = await response.json();
    renderProjects();
  } catch (error) {
    console.error("Error fetching projects:", error);
    alert("Failed to load projects. Please try again.");
  }
}

async function createProject(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create project");
    }
    const newProject = await response.json();
    currentProjects.push(newProject);
    renderProjects();
    hideForm();
  } catch (error) {
    console.error("Error creating project:", error.message);
    alert(`Failed to create project: ${error.message}`);
  }
}

async function updateProject(id, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update project");
    }
    await fetchProjects();
    hideForm();
  } catch (error) {
    console.error("Error updating project:", error.message);
    alert(`Failed to update project: ${error.message}`);
  }
}

async function deleteProject(id) {
  if (
    !confirm("Are you sure you want to delete this project and all its tasks?")
  ) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete project");
    }

    await fetchProjects();
    hideForm();
  } catch (error) {
    console.error("Error deleting project:", error.message);
    alert(`Failed to delete project: ${error.message}`);
  }
}

async function createTask(projectId, name, weight) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, weight }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create task");
    }

    await fetchProjects(); // Refresh all projects to get updated progress/status
    hideForm();
  } catch (error) {
    console.error("Error creating task:", error.message);
    alert(`Failed to create task: ${error.message}`);
  }
}

async function updateTask(projectId, taskId, name, status, weight) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status, weight }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update task");
    }
    await fetchProjects(); // Refresh all projects to get updated progress/status
    hideForm();
  } catch (error) {
    console.error("Error updating task:", error.message);
    alert(`Failed to update task: ${error.message}`);
  }
}

async function deleteTask(projectId, taskId) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      // Coba parsing error
      const errorText = await response.text(); // Ambil teks respons mentah
      let errorMessage = "Failed to delete task.";
      try {
        const errorData = JSON.parse(errorText); // Coba parsing sebagai JSON
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Jika bukan JSON
        console.warn("Response was not JSON, showing raw text:", errorText);
        errorMessage = `Server error (not JSON): ${errorText.substring(
          0,
          100
        )}...`;
      }
      throw new Error(errorMessage);
    }
    await fetchProjects(); // Refresh all projects to get updated progress/status
    hideForm();
  } catch (error) {
    console.error("Error deleting task:", error.message);
    alert(`Failed to delete task: ${error.message}`);
  }
}

// --- Render Functions ---

function renderProjects() {
  projectList.innerHTML = "";
  if (currentProjects.length === 0) {
    projectList.innerHTML =
      '<li class="list-group-item text-muted">No projects found. Add one!</li>';
    return;
  }

  currentProjects.forEach((project) => {
    const projectItem = document.createElement("li");
    projectItem.classList.add("list-group-item", "mb-3", "project-item");

    let tasksHtml = "";
    if (project.tasks && project.tasks.length > 0) {
      tasksHtml = `
                <ul class="task-list list-group mt-2">
                    ${project.tasks
                      .map(
                        (task) => `
                        <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                            data-task-id="${task.id}" data-project-id="${
                          project.id
                        }">
                            <span>
                                ${task.name} 
                                <span class="badge ${getStatusBadgeClass(
                                  task.status
                                )}">${task.status}</span> 
                                (Bobot: ${task.weight})
                            </span>
                            <button class="btn btn-sm btn-outline-info edit-task-btn" 
                                data-task-id="${task.id}" data-project-id="${
                          project.id
                        }">Edit</button>
                        </li>
                    `
                      )
                      .join("")}
                </ul>
            `;
    } else {
      tasksHtml = `<p class="text-muted mt-2">No tasks yet.</p>`;
    }

    projectItem.innerHTML = `
            <div class="project-header d-flex justify-content-between align-items-center">
                <h5 class="mb-1">${project.name}</h5>
                <button class="btn btn-sm btn-outline-primary add-task-btn" data-project-id="${
                  project.id
                }">+ Task</button>
            </div>
            <div class="project-details mt-2">
                Status: <span class="badge ${getStatusBadgeClass(
                  project.status
                )}">${project.status}</span><br>
                Progress: ${project.completion_progress}%
                <div class="progress mt-2">
                    <div class="progress-bar ${
                      project.completion_progress === 100
                        ? "bg-success"
                        : "bg-info"
                    }" role="progressbar" style="width: ${
      project.completion_progress
    }%" aria-valuenow="${
      project.completion_progress
    }" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            ${tasksHtml}
            <button class="btn btn-sm btn-outline-secondary edit-project-btn mt-3" data-project-id="${
              project.id
            }">Edit Project</button>
        `;

    projectList.appendChild(projectItem);
  });

  attachEventListeners();
}

// --- Event Listeners ---

function attachEventListeners() {
  projectList.removeEventListener("click", handleProjectListClick);
  projectList.addEventListener("click", handleProjectListClick);

  addProjectBtn.removeEventListener("click", handleAddProjectClick); // Prevent duplicates
  addProjectBtn.addEventListener("click", handleAddProjectClick);

  hideFormBtn.removeEventListener("click", hideForm); // Prevent duplicates
  hideFormBtn.addEventListener("click", hideForm);

  projectTaskForm.removeEventListener("submit", handleFormSubmit); // Prevent duplicates
  projectTaskForm.addEventListener("submit", handleFormSubmit);

  deleteBtn.removeEventListener("click", handleDeleteClick); // Prevent duplicates
  deleteBtn.addEventListener("click", handleDeleteClick);
}

function handleAddProjectClick() {
  showForm();
  formTitle.textContent = "Add Project";
  entityTypeInput.value = "project";
  entityIdInput.value = ""; // No ID for new project
  projectNameInput.value = ""; // Clear input

  projectFieldGroup.style.display = "block";
  taskFieldGroup.style.display = "none";
  deleteBtn.style.display = "none"; // No delete for new project
}

// Centralized event handler for projectList using event delegation
function handleProjectListClick(event) {
  const target = event.target;

  if (target.classList.contains("edit-project-btn")) {
    const projectId = target.dataset.projectId;
    const project = currentProjects.find((p) => p.id == projectId);
    if (project) {
      showForm();
      formTitle.textContent = "Edit Project";
      entityTypeInput.value = "project";
      entityIdInput.value = project.id;
      projectNameInput.value = project.name;

      projectFieldGroup.style.display = "block";
      taskFieldGroup.style.display = "none";
      deleteBtn.style.display = "inline-block";
    }
  } else if (target.classList.contains("add-task-btn")) {
    const projectId = target.dataset.projectId;
    showForm();
    formTitle.textContent = "Add Task";
    entityTypeInput.value = "task";
    entityIdInput.value = ""; // No task ID yet
    currentProjectIdInput.value = projectId; // Associate with this project

    projectFieldGroup.style.display = "none";
    taskFieldGroup.style.display = "block";
    taskNameInput.value = ""; // Clear for new task
    taskStatusInput.value = "Draft"; // Default for new task
    taskWeightInput.value = 1; // Default for new task
    deleteBtn.style.display = "none"; // No delete for new task
  } else if (target.classList.contains("edit-task-btn")) {
    // Find the closest parent list item to get the data attributes
    const taskItem = target.closest(".list-group-item");
    if (taskItem) {
      const taskId = taskItem.dataset.taskId;
      const projectId = taskItem.dataset.projectId;
      const project = currentProjects.find((p) => p.id == projectId);
      if (project && project.tasks) {
        const task = project.tasks.find((t) => t.id == taskId);
        if (task) {
          showForm();
          formTitle.textContent = "Edit Task";
          entityTypeInput.value = "task";
          entityIdInput.value = task.id;
          currentProjectIdInput.value = projectId;

          taskNameInput.value = task.name;
          taskStatusInput.value = task.status;
          taskWeightInput.value = task.weight;

          projectFieldGroup.style.display = "none";
          taskFieldGroup.style.display = "block";
          deleteBtn.style.display = "inline-block";
        }
      }
    }
  }
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const entityType = entityTypeInput.value;
  const entityId = entityIdInput.value;

  if (entityType === "project") {
    const projectName = projectNameInput.value.trim();
    if (!projectName) {
      alert("Project name cannot be empty.");
      return;
    }
    if (entityId) {
      await updateProject(entityId, projectName);
    } else {
      await createProject(projectName);
    }
  } else if (entityType === "task") {
    const currentProjectId = currentProjectIdInput.value;
    const taskName = taskNameInput.value.trim();
    const taskStatus = taskStatusInput.value;
    const taskWeight = parseInt(taskWeightInput.value, 10);

    if (!taskName) {
      alert("Task name cannot be empty.");
      return;
    }
    if (isNaN(taskWeight) || taskWeight < 1) {
      alert("Task weight must be a positive number.");
      return;
    }

    if (entityId) {
      await updateTask(
        currentProjectId,
        entityId,
        taskName,
        taskStatus,
        taskWeight
      );
    } else {
      await createTask(currentProjectId, taskName, taskWeight);
    }
  }
}

async function handleDeleteClick() {
  const entityType = entityTypeInput.value;
  const entityId = entityIdInput.value;
  const currentProjectId = currentProjectIdInput.value; // Relevant for task deletion

  if (entityType === "project" && entityId) {
    await deleteProject(entityId);
  } else if (entityType === "task" && entityId && currentProjectId) {
    await deleteTask(currentProjectId, entityId);
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", fetchProjects);
