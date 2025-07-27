// Grab DOM elements
const habitForm = document.getElementById('habit-form');
const habitNameInput = document.getElementById('habit-name');
const habitTableContainer = document.getElementById('habit-table-container');
const yearSpan = document.getElementById('year');

// Array to hold habit objects
let habits = [];

/**
 * Load habits from localStorage. If none exist, initialise to an empty array.
 */
function loadHabits() {
  const stored = localStorage.getItem('habits');
  try {
    habits = stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error parsing habits from localStorage:', err);
    habits = [];
  }
}

/**
 * Persist the current habits array to localStorage.
 */
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

/**
 * Generate an array of ISO-formatted date strings for the last 7 days, starting
 * with the earliest (six days ago) and ending with today.
 *
 * @returns {string[]} An array of date strings in `YYYY-MM-DD` format.
 */
function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    // Format to YYYY-MM-DD; slice to 10 chars to drop the time
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * Convert an ISO-formatted date string into a more human friendly string
 * showing the weekday, month and day (e.g., "Mon Jul 27").
 *
 * @param {string} dateString - A date string in `YYYY-MM-DD` format.
 * @returns {string} Formatted date for display.
 */
function formatDateDisplay(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Render the table of habits, including the last seven days, progress bar
 * and actions. Attaches event listeners to checkboxes and delete buttons.
 */
function renderTable() {
  const days = getLast7Days();

  // Start constructing table markup
  let html = '<table><thead><tr><th>Habit</th>';
  days.forEach(dateStr => {
    html += `<th>${formatDateDisplay(dateStr)}</th>`;
  });
  html += '<th>Progress</th><th>Actions</th></tr></thead><tbody>';

  habits.forEach(habit => {
    html += '<tr>';
    // Habit name column
    html += `<td>${habit.name}</td>`;

    // Track number of days completed for progress calculation
    let completedCount = 0;
    days.forEach(dateStr => {
      const checked = habit.history[dateStr] ? 'checked' : '';
      if (habit.history[dateStr]) completedCount++;
      html += `<td><input type="checkbox" data-habit-id="${habit.id}" data-date="${dateStr}" ${checked}></td>`;
    });

    // Calculate progress as a percentage
    const progressPercent = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;
    // Progress bar
    html += `<td class="progress-cell"><div class="progress-wrapper"><div class="progress-bar" style="width:${progressPercent}%"></div></div><span class="progress-text">${completedCount}/${days.length}</span></td>`;

    // Actions column (delete button)
    html += `<td><button class="delete-btn" data-habit-id="${habit.id}">Delete</button></td>`;
    html += '</tr>';
  });
  html += '</tbody></table>';

  // Update DOM
  habitTableContainer.innerHTML = html;

  // Attach event listeners to checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', event => {
      const habitId = parseInt(event.target.getAttribute('data-habit-id')); 
      const date = event.target.getAttribute('data-date');
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        habit.history[date] = event.target.checked;
        saveHabits();
        // Re-render to update progress bar instantly
        renderTable();
      }
    });
  });

  // Attach event listeners to delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', event => {
      const habitId = parseInt(event.target.getAttribute('data-habit-id'));
      habits = habits.filter(h => h.id !== habitId);
      saveHabits();
      renderTable();
    });
  });
}

// Handle form submission for adding new habits
habitForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;
  const newHabit = {
    id: Date.now(),
    name: name,
    history: {}
  };
  habits.push(newHabit);
  saveHabits();
  habitNameInput.value = '';
  renderTable();
});

/**
 * Initialise the app by loading stored habits, setting the footer year and
 * rendering the initial table.
 */
function init() {
  loadHabits();
  // Display current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  renderTable();
}

// Initialise when window loads
window.addEventListener('load', init);
