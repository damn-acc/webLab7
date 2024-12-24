const playButton = document.getElementById('play');
const workArea = document.getElementById('work');
const square = document.getElementById('square');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const reloadButton = document.getElementById('reload');
const closeButton = document.getElementById('close');
const currLog = document.getElementById('logs');
const eventLog = document.getElementById('event-log');
const animArea = document.getElementById('anim'); // Додаємо цю змінну

let animationInterval;
let step = 1;
const directions = ['right', 'down', 'left', 'up'];
let directionIndex = 0;
let events = JSON.parse(localStorage.getItem('events')) || [];


window.addEventListener('load', () => {
    renderEventTable();

    fetch('clear_logs.php', {
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Log files cleared:', data);
        data.forEach(fileStatus => {
            if (fileStatus.status === 'success') {
                console.log(`${fileStatus.file}: ${fileStatus.message}`);
            } else {
                console.warn(`${fileStatus.file}: ${fileStatus.message}`);
            }
        });
    })
    .catch(error => {
        console.error('Error clearing log files:', error);
    });
});



playButton.addEventListener('click', () => {
    workArea.style.display = 'block';
    playButton.style.display = 'none';
    eventLog.style.display = 'none'
    localStorage.removeItem('events');

    fetch('clear_logs.php', {
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Log files cleared:', data);
        data.forEach(fileStatus => {
            if (fileStatus.status === 'success') {
                console.log(`${fileStatus.file}: ${fileStatus.message}`);
            } else {
                console.warn(`${fileStatus.file}: ${fileStatus.message}`);
            }
        });
    })
    .catch(error => {
        console.error('Error clearing log files:', error);
    });

    logEvent('Work area opened');
});

function logEvent(message) {
    try {
        events = JSON.parse(localStorage.getItem('events')) || [];
    } catch (error) {
        console.error('Error parsing events from localStorage:', error);
        events = [];
    }

    const event_for_local = {
        id: events.length + 1,
        time: new Date().toLocaleTimeString(),
        message,
    };

    events.push(event_for_local);
    try {
        localStorage.setItem('events', JSON.stringify(events));
    } catch (error) {
        console.error('Error saving events to localStorage:', error);
    }

    if (currLog) {
        currLog.textContent = `${event_for_local.time}: ${event_for_local.message}`;
    } else {
        console.warn('logDiv is not available in the DOM.');
    }

    const event_for_instantly = {
        id: event_for_local.id,
        message,
    };

    fetch('upload_instantly.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event_for_instantly),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            console.warn('Response is not JSON:', contentType);
            return null;
        }
    })
    .then((data) => {
        if (data) {
            console.log('Success:', data);
        } else {
            console.log('No JSON content in response');
        }
    })
    .catch((error) => {
        console.error('Fetch error:', error);
    });
}

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    stopButton.style.display = 'inline';
    startAnimation();
});

stopButton.addEventListener('click', () => {
    clearInterval(animationInterval);
    logEvent('Animation stopped');
    stopButton.style.display = 'none';
    startButton.style.display = 'inline';
});

reloadButton.addEventListener('click', () => {
    square.style.left = '50%';
    square.style.top = '50%';
    direction = directions[0];
    step = 1;
    reloadButton.style.display = 'none';
    startButton.style.display = 'inline';
    logEvent('Square reset to initial position');
});

closeButton.addEventListener('click', () => {
    workArea.style.display = 'none';
    playButton.style.display = 'inline';
    eventLog.style.display = 'block'
    logEvent('Work area closed');

    sendLocalStorageDataToServer()

    fetchEventLogs();
});


function startAnimation() {
    logEvent('Animation started');
    let x = square.offsetLeft;
    let y = square.offsetTop;

    animationInterval = setInterval(() => {
        const animRect = animArea.getBoundingClientRect();
        const squareRect = square.getBoundingClientRect();

        const isWithinBounds = (
            squareRect.left >= animRect.left &&
            squareRect.right <= animRect.right &&
            squareRect.top >= animRect.top &&
            squareRect.bottom <= animRect.bottom
        );

        const direction = directions[directionIndex];

        if (direction === "right") x += step;
        if (direction === "down") y += step;
        if (direction === "left") x -= step;
        if (direction === "up") y -= step;

        square.style.left = `${x}px`;
        square.style.top = `${y}px`;
        logEvent(`Square moved to (${x}, ${y})`);

        if (!isWithinBounds) {
            clearInterval(animationInterval);
            logEvent('Square exited the animation area');
            stopButton.style.display = 'none';
            reloadButton.style.display = 'inline';
            return;
        }

        directionIndex = (directionIndex + 1) % directions.length;
        step += 2;
    }, 300);
}


async function sendLocalStorageDataToServer() {
    const data = localStorage.getItem('events');

    if (!data) {
        console.log('No data in LocalStorage to send.');
        return;
    }

    try {
        const response = await fetch('upload_local_to_server.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events: JSON.parse(data) }),
        });

        if (response.ok) {
            // Перевіряємо, чи відповідає сервер JSON
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                console.log('Data successfully sent to the server:', result);
            } else {
                console.error('Expected JSON, but got:', contentType);
            }
        } else {
            console.error('Failed to send data:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending data to server:', error);
    }
}

function fetchEventLogs() {
    fetch('get_event_logs.php')
        .then(response => {
            console.log('Response status:', response.status);  // Логування статусу
            return response.text();  // Отримуємо відповідь як текст
        })
        .then(text => {
            console.log('Response text:', text);  // Логування текстової відповіді
            try {
                const data = JSON.parse(text);  // Пробуємо перетворити текст у JSON
                renderEventTable(data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        })
        .catch(error => {
            console.error('Error fetching event logs:', error);
        });
}

function renderEventTable(data) {
    eventLog.innerHTML = '';

    if (data && data.length > 0) {
        const table = document.createElement('table');
        table.innerHTML = '<tr><th>ID</th><th>Action</th><th>Time from server</th><th>Time from local storage</th></tr>';

        data.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.id}</td>
                <td>${event.action}</td>
                <td>${event.time_server}</td>
                <td>${event.time_local_storage}</td>
            `;
            table.appendChild(row);
        });

        eventLog.appendChild(table);
    } else {
        eventLog.innerHTML = '<p>No event logs found.</p>';
    }
}
