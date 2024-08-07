async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function createTable(data) {
  const table = document.getElementById('jsonTable').getElementsByTagName('tbody')[0];
  data.forEach(item => {
    const row = table.insertRow();
    row.insertCell().textContent = item.num;
    row.insertCell().textContent = item.date_meet;
    row.insertCell().textContent = item.date_pub;
    const subjCell = row.insertCell();
    if (item.subj) {
      const subjLink = document.createElement('a');
      subjLink.href = item.url;
      subjLink.textContent = item.subj;
      subjCell.appendChild(subjLink);
      if (item.blog) {
        const blogLink = document.createElement('a');
        blogLink.href = item.blog;
        blogLink.textContent = '[blog post]';
        subjCell.appendChild(document.createTextNode(' '));
        if (blogLink instanceof Node) {
          subjCell.appendChild(blogLink);
        } else {
          console.error('blogLink is not a Node:', blogLink);
        }
      }
      if (item.msg) {
        const renderedMsg = document.createTextNode(' (Note: ' + item.msg + ')');
        subjCell.appendChild(renderedMsg);
      }
    } else {
      subjCell.textContent = item.msg;
    }
    const attendeesCell = row.insertCell();
    if (item.attendees) {
      attendeesCell.textContent = item.attendees.join(', ');
    } else {
      attendeesCell.textContent = '';
    }
    const scribeCell = row.insertCell();
    if (item.scribe) {
      scribeCell.textContent = item.scribe;
    } else {
      scribeCell.textContent = '';
    }
    const inviteesCell = row.insertCell();
    if (item.invitees) {
      inviteesCell.textContent = item.invitees.join(', ');
    } else {
      inviteesCell.textContent = '';
    }
  });
}

function compareRows(a, b, columnIndex) {
    const aText = a.cells[columnIndex].textContent.trim();
    const bText = b.cells[columnIndex].textContent.trim();
    return aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' });
}

function sortTable(columnIndex) {
  const table = document.getElementById('jsonTable');
  const columnHeader = table.getElementsByTagName('th')[columnIndex];

  const sortOrder = columnHeader.getAttribute('data-sort-order');
  columnHeader.setAttribute('data-sort-order', sortOrder === 'asc' ? 'desc' : 'asc');

  // Update sort icons
  const allSortableHeaders = table.querySelectorAll('th[data-sort-order]');
  allSortableHeaders.forEach(header => {
    const icon = header.querySelector('.sort-icon');
    icon.classList.remove('bi-arrow-down', 'bi-arrow-up');
    icon.classList.add('bi-arrow-down-up');
  });

  const currentIcon = columnHeader.querySelector('.sort-icon');
  currentIcon.classList.remove('bi-arrow-down-up');
  currentIcon.classList.add(sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down');

  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const sortedRows = rows.sort((a, b) => {
    const comparison = compareRows(a, b, columnIndex) || compareRows(a, b, 1); // date_meet tiebreak
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  sortedRows.forEach((row, index) => {
    const newRow = tbody.insertRow(index);
    newRow.className = row.className;

    Array.from(row.cells).forEach((cell, cellIndex) => {
      newRow.insertCell(cellIndex).innerHTML = cell.innerHTML;
    });

    tbody.deleteRow(index + 1);
  });
}

async function init() {
  const json_url = '/psc.json';
  const data = await fetchJSON(json_url);
  createTable(data);
  sortTable(0);

  let url = location.href.replace(/\/$/, "");

  if (location.hash) {
    const hash = url.split('#');

    let tabTrigger = document.querySelector(`#nav-tab button[data-bs-target="#${hash[1]}"]`);
    if (tabTrigger) { // Check if the tabTrigger exists
        let tab = new bootstrap.Tab(tabTrigger);
        tab.show();
    }
    url = location.href.replace(/\/#.+/, '/');
}
}

init();

