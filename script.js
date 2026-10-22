
const tableBody = document.getElementById("studentTableBody");
const studentCount = document.getElementById("studentCount");
const studentForm = document.getElementById("studentForm");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const formMessage = document.getElementById("formMessage");

let students = [];
let nextId = 1;

async function loadStudents() {
  try {
    const savedStudents = localStorage.getItem("students");

    if (savedStudents !== null) {
      students = JSON.parse(savedStudents);
    } else {
      const response = await fetch("./students.json");

      if (!response.ok) {
        throw new Error("Could not load student records.");
      }

      students = await response.json();
    }

    nextId = students.reduce(
      (max, student) => Math.max(max, student.id),
      0
    ) + 1;

    renderStudents();
  } catch (error) {
    emptyMessage.hidden = false;
    emptyMessage.textContent =
      "Unable to load students. Please run the project using Live Server.";
    console.error(error);
  }
}

function saveStudents() {
  try {
    localStorage.setItem("students", JSON.stringify(students));
    return true;
  } catch (error) {
    formMessage.textContent =
      "Could not save changes in this browser.";
    return false;
  }
}

function renderStudents() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const visibleStudents = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchTerm) ||
      student.course.toLowerCase().includes(searchTerm)
    );
  });

  tableBody.replaceChildren();

  visibleStudents.forEach((student) => {
    const row = document.createElement("tr");

    [student.id, student.name, student.course, student.email]
      .forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
      deleteStudent(student.id);
    });

    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    tableBody.appendChild(row);
  });

  studentCount.textContent = visibleStudents.length;

  emptyMessage.hidden = visibleStudents.length > 0;
  emptyMessage.textContent = searchTerm
    ? "No students match your search. Try another name or course."
    : "No student records available. Add your first student above.";
}

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!name || !email || !course) {
    formMessage.textContent = "Please fill in all fields.";
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    formMessage.textContent = "Please enter a valid email address.";
    return;
  }

  const newStudent = {
    id: nextId,
    name,
    email,
    course
  };

  students.push(newStudent);

  if (!saveStudents()) {
    students.pop();
    return;
  }

  nextId++;
  studentForm.reset();
  formMessage.textContent = "Student added successfully.";
  renderStudents();
});

searchInput.addEventListener("input", renderStudents);

function deleteStudent(id) {
  const student = students.find((item) => item.id === id);

  if (!student) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${student.name}?`
  );

  if (!confirmed) return;

  const previousStudents = students;
  students = students.filter((item) => item.id !== id);

  if (!saveStudents()) {
    students = previousStudents;
    return;
  }

  formMessage.textContent = "Student deleted successfully.";
  renderStudents();
}

loadStudents();
