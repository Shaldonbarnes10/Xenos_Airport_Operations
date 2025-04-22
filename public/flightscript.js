let flights = [];

// Format time if it's missing seconds
const formatTimeInput = (time) =>
    time.split(':').length === 2 ? `${time}:00` : time;

// Load flights when page loads
document.addEventListener('DOMContentLoaded', loadFlights);

// Submit form to Add or Edit flight
flightForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const editingId = form.getAttribute('data-edit-id');

    const rawDeptTime = document.getElementById('dept_time').value;
    const rawArrTime = document.getElementById('arr_time').value;

    const flightData = {
        flight_name: document.getElementById('flight_name').value,
        flight_no: document.getElementById('flight_no').value,
        flight_date: document.getElementById('flight_date').value,
        dept_time: formatTimeInput(rawDeptTime),
        arr_time: formatTimeInput(rawArrTime),
        gate_id: parseInt(document.getElementById('gate_id').value),
        terminal: document.getElementById('terminal').value,
        status: document.getElementById('status').value
    };

    try {
        if (editingId) {
            // Edit mode
            const response = await fetch(`/api/flights/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update flight');
            }

            alert('Flight updated successfully!');
            form.removeAttribute('data-edit-id');
        } else {
            // Add mode
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add flight');
            }

            alert('Flight added successfully!');
        }

        flightForm.reset();
        loadFlights();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});

// Load all flights
async function loadFlights() {
    try {
        const response = await fetch('/api/flights');
        if (!response.ok) throw new Error('Failed to fetch flights');

        flights = await response.json();
        const flightTableBody = document.querySelector('#flightTable tbody');
        flightTableBody.innerHTML = '';

        flights.forEach(flight => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${flight.flight_id}</td>
                <td>${flight.flight_name}</td>
                <td>${flight.flight_no}</td>
                <td>${flight.flight_date}</td>
                <td>${flight.dept_time}</td>
                <td>${flight.arr_time}</td>
                <td>${flight.terminal}</td>
                <td>${flight.gate_id}</td>
                <td>${flight.status}</td>
                <td>
                    <button onclick="editFlight(${flight.flight_id})">Edit</button>
                    <button onclick="deleteFlight(${flight.flight_id})">Delete</button>
                </td>
            `;
            flightTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading flights:', error);
    }
}

// Delete a flight
async function deleteFlight(flightId) {
    if (!confirm('Are you sure you want to delete this flight?')) return;

    try {
        const response = await fetch(`/api/flights/${flightId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete flight');

        loadFlights();
    } catch (error) {
        console.error('Error deleting flight:', error);
    }
}

// Edit a flight: fill form with selected flight's data
function editFlight(flightId) {
    const flight = flights.find(f => f.flight_id === flightId);
    if (!flight) return alert('Flight not found');

    document.getElementById('flight_name').value = flight.flight_name;
    document.getElementById('flight_no').value = flight.flight_no;
    document.getElementById('flight_date').value = flight.flight_date;
    document.getElementById('dept_time').value = flight.dept_time;
    document.getElementById('arr_time').value = flight.arr_time;
    document.getElementById('gate_id').value = flight.gate_id;
    document.getElementById('terminal').value = flight.terminal;
    document.getElementById('status').value = flight.status;

    // Set flag for edit mode
    flightForm.setAttribute('data-edit-id', flightId);
}
