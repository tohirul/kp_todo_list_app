//container div where all the task lists are shown in the ui
const listContainer = document.querySelector("[data-lists]");
// form to submit the task list name
const newListForm = document.querySelector("[data-new-list-form]");
// input element where the list title is submitted from
const newListInput = document.querySelector("[data-new-list-input]");
// task form where the name of tasks are submitted for a selected list
const newTaskForm = document.querySelector("[data-new-task-form]");
// input element to submit the task name from
const newTaskInput = document.querySelector("[data-new-task-input]");
// delete list button element. Using this the selected list is deleted from the list
const deleteListButton = document.querySelector("[data-delete-list-button]");
// button to remove all the completed tasks from the list
const deleteCompletedTasksButton = document.querySelector(
  "[data-clear-complete-task-button]"
);
// container div where all the completed tasks are generated
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
// here the selected task title is displayed on top of the task display container
const listTitleElement = document.querySelector("[data-list-title]");
// here the remaining tasks are displayed which are not completed yet
const listCountElement = document.querySelector("[data-list-count]");
// all the tasks are appended inside this container
const taskContainer = document.querySelector("[data-tasks]");
// this is a template with which the tasks are generated dynamically
const taskTemplate = document.getElementById("task-template");
// this key is used to toggle a list from the array of lists
const LOCAL_STORAGE_LIST_ID_KEY = "task.selected.list.id";
//  toggling the selected list results in display of the tasks in the selected list
// this is the id of the list that is active to display the tasks
let selectedListId = localStorage.getItem(LOCAL_STORAGE_LIST_ID_KEY);
// this key is used to both store and retrieve data from the local storage
const LOCAL_STORAGE_KEY = "task.lists";
// all the task lists are retrieved from the local storage and rendered in a array called lists
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

// function to use while developing to check the error scope
const renderTrouble = () => {
  console.log("renderTrouble");
};

// save data to local storage
const saveToLocalStorage = () => {
  //   console.log("lists to local saveToLocalStorage", lists);
  localStorage.setItem(LOCAL_STORAGE_LIST_ID_KEY, selectedListId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
};

// if there is no task list available
// this function will be called
const renderNoList = () => {
  const li = document.createElement("li");
  li.classList.add("list-name", "active-list");
  li.innerText = `No tasks list available.`;
  listContainer.appendChild(li);
};

// function by which the ui is rendered
// also to rerender the site and store data in localStorage when needed
function render() {
  clearElement(listContainer);
  // console.log(selectedListId);
  // condition to check if the list is retrieved from the local storage successfully
  // or if there is a list inside the array
  !lists || lists.length < 1 ? renderNoList() : renderLists();
  // to check if the selected list exists in the local storage
  // if the list exists in the local storage the list will be rendered
  if (selectedListId != null) renderSelectedList();
  saveToLocalStorage();
}

// clear HTML elements before rerendering the ui
const clearElement = (element) => {
  // console.log("clearing element", element);
  element.innerHTML = "";
};

// onsubmit function to store a brand new task list in the localStorage
newListForm.onsubmit = (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  //condition to check if a valid name is provided
  if (listName == null || listName === "") return;
  // creating a new list
  const list = createList(listName);
  newListInput.value = null;
  // storing the new list object in the local storage
  lists.push(list);
  clearElement(listContainer && taskContainer);
  render();
};

// create new list
function createList(name) {
  return {
    id: Date.now().toString(),
    title: name,
    tasks: [],
  };
}

// function by which the list is selected to display the tasks within;
// on the click, the id of the task will be stored in the local storage as selectedListId
// after selecting the active list the task can be checked and
// selected list can also be deleted
listContainer.onclick = (e) => {
  if (e.target.tagName.toLowerCase() === "li") {
    selectedListId = e.target.dataset.listId;
    clearElement(taskContainer);
    render();
  }
};

// task submit form to create a new task in the selected list
// new task will be stored in a array inside the list object
newTaskForm.onsubmit = (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  // console.log(taskName);
  // condition to check if the name is valid
  if (taskName == null || taskName === "") return;
  // creating a new task
  // by calling the function and sending the name value to the callback
  // this function will generate the task object
  const task = createTask(taskName);
  newTaskInput.value = null;
  // finding the selected list using the list id
  // the generated task will be pushed inside the selectedList
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks.push(task);
  clearElement(taskContainer);
  render();
};

// function to generate a task
const createTask = (name) => {
  // name is passed from the input field as props
  return {
    id: Date.now().toString(),
    name: name,
    complete: false,
  };
};

// if the task list is not empty this function is called
// all the list names will be passed through this function
// to render the list names on the ui
const renderLists = () => {
  // using map array method to go through all the lists in the array
  // and render them on the ui
  lists.map((list) => {
    const li = document.createElement("li");
    li.dataset.listId = list.id;
    li.classList.add("list-name");
    li.innerText = list.title;
    if (list.id === selectedListId) {
      li.classList.add("active-list");
    }
    listContainer.appendChild(li);
  });
};

// checking the selected list
// if the list exists the container will show existing tasks
// to toggle this function list title has to be clicked
// on click the list will be selected active
// otherwise the container will be hidden
const renderSelectedList = () => {
  // using find method to derive the selected list
  // selected list id is retrieved from the local storage
  // by matching with all the list id values
  // the selected list is returned
  const selectedList = lists.find((list) => list.id === selectedListId);
  // condition to check the selected list exists
  // if the list exists then the selected list will be rendered on the ui
  if (selectedListId == null || !selectedList) {
    listDisplayContainer.style.display = "none";
  } else if (selectedListId != null && selectedList) {
    listDisplayContainer.style.display = "block";
    renderListTitle(selectedList);
    renderTaskCount(selectedList);
    renderTasks(selectedList);
  }
};

// function to display list title on the task container
const renderListTitle = (selectedList) => {
  listTitleElement.innerText = selectedList.title;
};

// function to display the number of tasks which are currently incomplete
// this function is called every time a task is checked out as completed
const renderTaskCount = (selectedList) => {
  const incompleteTaskCount = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
  listCountElement.innerText = ` ${incompleteTaskCount} ${taskString} remaining`;
};

// to display the tasks in the selected list
// this function will be called
// when called this function will generate the data dynamically on the ui
const renderTasks = (selectedList) => {
  selectedList.tasks.map((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    label.htmlFor = task.id;
    label.append(task.name);
    taskContainer.appendChild(taskElement);
  });
};

// onclick function to toggle the check box
// for if the task is completed or not completed
taskContainer.onclick = (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list) => list.id === selectedListId);
    console.log(selectedList);
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    renderTaskCount(selectedList);
    clearElement(taskContainer);
    render();
  }
};

// onclick function to filter out the incomplete task from the tasks array
// and remove them from the local storage
deleteCompletedTasksButton.onclick = (e) => {
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveToLocalStorage();
  clearElement(taskContainer);
  render();
};

// onclick button event to remove the selected list from the local storage
deleteListButton.onclick = () => {
  lists = lists.filter((list) => list.id !== selectedListId);
  selectedListId = null;
  saveToLocalStorage();
  listDisplayContainer.style.display = "none";
  render();
};

render();
