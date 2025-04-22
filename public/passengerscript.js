document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('passengerTableBody');
    const form = document.getElementById('passengerForm');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    let isEditing = false;
    let currentEditId = null;

    // Fetch and display passengers
    async function loadPassengers() {
        try {
            const res = await fetch('/api/passengers');
            const passengers = await res.json();

            tableBody.innerHTML = ''; // Clear previous
            passengers.forEach(addPassengerToTable);
        } catch (err) {
            console.error('Failed to fetch passengers:', err);
        }
    }

    // Add passenger row to table
    function addPassengerToTable(p) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.pass_id}</td>
            <td>${p.pass_name}</td>
            <td>${p.flight_name}</td>
            <td>${p.flight_no}</td>
            <td>${new Date(p.dept_time).toLocaleString()}</td>
            <td>
                <button class="edit-btn" data-id="${p.pass_id}">Edit</button>
                <button class="delete-btn" data-id="${p.pass_id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);

        // Add event listeners to the new buttons
        row.querySelector('.edit-btn').addEventListener('click', () => editPassenger(p));
        row.querySelector('.delete-btn').addEventListener('click', () => deletePassenger(p.pass_id));
    }

    // Handle form submit
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const passengerData = {
            pass_name: document.getElementById('pass_name').value,
            flight_name: document.getElementById('flight_name').value,
            flight_no: document.getElementById('flight_no').value,
            dept_time: document.getElementById('dept_time').value
        };

        try {
            let url = '/api/passengers';
            let method = 'POST';
            
            if (isEditing) {
                url += `/${currentEditId}`;
                method = 'PUT';
                passengerData.pass_id = currentEditId;
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passengerData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to process passenger');

            if (isEditing) {
                loadPassengers(); // Reload the table to reflect changes
                resetForm();
            } else {
                addPassengerToTable(data.passenger);
                form.reset();
            }
        } catch (err) {
            console.error('Passenger operation error:', err);
            alert(`Failed to ${isEditing ? 'update' : 'add'} passenger`);
        }
    });

    // Edit passenger
    function editPassenger(passenger) {
        isEditing = true;
        currentEditId = passenger.pass_id;
        
        document.getElementById('pass_id').value = passenger.pass_id;
        document.getElementById('pass_name').value = passenger.pass_name;
        document.getElementById('flight_name').value = passenger.flight_name;
        document.getElementById('flight_no').value = passenger.flight_no;
        
        // Format the date for the datetime-local input
        const deptDate = new Date(passenger.dept_time);
        const formattedDate = deptDate.toISOString().slice(0, 16);
        document.getElementById('dept_time').value = formattedDate;
        
        submitBtn.textContent = 'Update Passenger';
        cancelBtn.style.display = 'inline-block';
    }

    // Delete passenger
    async function deletePassenger(passId) {
        if (!confirm('Are you sure you want to delete this passenger?')) return;
        
        try {
            const res = await fetch(`/api/passengers/${passId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete passenger');

            loadPassengers(); // Reload the table
        } catch (err) {
            console.error('Delete passenger error:', err);
            alert('Failed to delete passenger');
        }
    }

    // Cancel edit
    cancelBtn.addEventListener('click', resetForm);

    function resetForm() {
        isEditing = false;
        currentEditId = null;
        form.reset();
        document.getElementById('pass_id').value = '';
        submitBtn.textContent = 'Add Passenger';
        cancelBtn.style.display = 'none';
    }

    // Load passengers on start
    loadPassengers();
});