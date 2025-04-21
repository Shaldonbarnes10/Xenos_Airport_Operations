// // Submit form and add flight
// flightForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const rawDeptTime = document.getElementById('dept_time').value;
//     const rawArrTime = document.getElementById('arr_time').value;
    
//     const formatTimeInput = (time) => 
//         time.split(':').length === 2 ? `${time}:00` : time;
    
//     const flightData = {
//         flight_name: document.getElementById('flight_name').value,
//         flight_no: document.getElementById('flight_no').value,
//         dept_time: formatTimeInput(rawDeptTime),
//         arr_time: formatTimeInput(rawArrTime),
//         gate_id: parseInt(document.getElementById('gate_id').value)
//     };
    
//     try {
//         const response = await fetch('/api/flights', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(flightData)
//         });
        
//         if (!response.ok) {
//             const error = await response.json();
//             throw new Error(error.error || 'Failed to add flight');
//         }
        
//         flightForm.reset();
//         loadFlights();
//         alert('Flight added successfully!');
//     } catch (error) {
//         console.error('Error:', error);
//         alert(`Error: ${error.message}`);
//     }
//   });
  
//   // Fetch and display flights
//   async function loadFlights() {
//       try {
//           const response = await fetch('/api/flights');
//           if (!response.ok) {
//               throw new Error('Failed to fetch flights');
//           }
//           const flights = await response.json();
  
//           const flightTableBody = document.querySelector('#flightTable tbody');
//           flightTableBody.innerHTML = '';
  
//           flights.forEach(flight => {
//               const row = document.createElement('tr');
//               row.innerHTML = `
//                   <td>${flight.flight_id}</td>
//                   <td>${flight.flight_name}</td>
//                   <td>${flight.flight_no}</td>
//                   <td>${flight.dept_time}</td>
//                   <td>${flight.arr_time}</td>
//                   <td>${flight.gate_id}</td>
//                   <td><button onclick="deleteFlight(${flight.flight_id})">Delete</button></td>
//               `;
//               flightTableBody.appendChild(row);
//           });
//       } catch (error) {
//           console.error('Error loading flights:', error);
//       }
//   }
  
//   // Delete a flight
//   async function deleteFlight(flightId) {
//       if (!confirm('Are you sure you want to delete this flight?')) {
//           return;
//       }
  
//       try {
//           const response = await fetch(`/api/flights/${flightId}`, {
//               method: 'DELETE'
//           });
  
//           if (!response.ok) {
//               throw new Error('Failed to delete flight');
//           }
  
//           loadFlights();
//       } catch (error) {
//           console.error('Error deleting flight:', error);
//       }
//   }
  
//   // Load flights when page loads
//   document.addEventListener('DOMContentLoaded', loadFlights);
  

// Submit form and add flight
flightForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawDeptTime = document.getElementById('dept_time').value;
    const rawArrTime = document.getElementById('arr_time').value;

    const formatTimeInput = (time) =>
        time.split(':').length === 2 ? `${time}:00` : time;

    const flightData = {
        flight_name: document.getElementById('flight_name').value,
        flight_no: document.getElementById('flight_no').value,
        dept_time: formatTimeInput(rawDeptTime),
        arr_time: formatTimeInput(rawArrTime),
        gate_id: parseInt(document.getElementById('gate_id').value),
        terminal: document.getElementById('terminal').value,
        status: document.getElementById('status').value
    };

    try {
        const response = await fetch('/api/flights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flightData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add flight');
        }

        flightForm.reset();
        loadFlights();
        alert('Flight added successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});

// Fetch and display flights
async function loadFlights() {
    try {
        const response = await fetch('/api/flights');
        if (!response.ok) throw new Error('Failed to fetch flights');

        const flights = await response.json();
        const flightTableBody = document.querySelector('#flightTable tbody');
        flightTableBody.innerHTML = '';

        flights.forEach(flight => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${flight.flight_id}</td>
                <td>${flight.flight_name}</td>
                <td>${flight.flight_no}</td>
                <td>${flight.dept_time}</td>
                <td>${flight.arr_time}</td>
                <td>${flight.terminal}</td>
                <td>${flight.gate_id}</td>
                <td>${flight.status}</td>
                <td><button onclick="deleteFlight(${flight.flight_id})">Delete</button></td>
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

// Load flights when page loads
document.addEventListener('DOMContentLoaded', loadFlights);
