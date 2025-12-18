let complaints = [];
let nextId = 1;
let userRelations = {};

// ---------- Utils ----------
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ---------- Relate Toggle ----------
function toggleRelate(id) {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return;

    complaint.related = !complaint.related;
    complaint.relateCount += complaint.related ? 1 : -1;

    userRelations[id] = complaint.related;
    saveComplaints();
    renderComplaints();
}

// ---------- Load CSV ----------
async function loadComplaints() {
    try {
        const response = await fetch('complaints.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: results => {
                complaints = results.data.map(row => ({
                    id: row.id,
                    topic: row.topic,
                    uni: row.uni || '',
                    description: row.description,
                    date: row.date,
                    relateCount: row.relateCount || 0,
                    related: false
                }));

                if (complaints.length) {
                    nextId = Math.max(...complaints.map(c => c.id)) + 1;
                }

                renderComplaints();
            }
        });
    } catch(error) {
        console.log(error)
        complaints = [
            {
                id: 1,
                topic: "Infrastructure",
                uni: "FST",
                description: "Library AC has been broken for weeks.",
                date: "2025-12-15",
                relateCount: 23,
                related: false
            }
        ];
        nextId = 2;
        renderComplaints();
    }
}

// ---------- Save CSV ----------
function saveComplaints() {}
//   const csv = Papa.unparse(
//       complaints.map(c => ({
//           id: c.id,
//           topic: c.topic,
//           uni: c.uni,
//           description: c.description,
//           date: c.date,
//           relateCount: c.relateCount
//       }))
//   );
//
//   const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement('a');
//   link.href = URL.createObjectURL(blob);
//   link.download = 'complaints.csv';
//   link.click();
//

// ---------- Render ----------
function renderComplaints() {
    const list = document.getElementById('complaintsList');

    if (!complaints.length) {
        list.innerHTML = `<p>No complaints yet.</p>`;
        return;
    }

    list.innerHTML = complaints.map(c => {
        let relate = c.relateCount === 1 ? "person relates" : "people relate";

        return `
            <div class="complaint-card">
                <div class="complaint-header">
                    <span class="complaint-topic">${c.topic}</span>
                    <span class="complaint-date">${formatDate(c.date)}</span>
                    <span class="complaint-uni">${c.uni}</span>
                </div>

                <p>${c.description}</p>

                <div class="complaint-footer">
                    <span>${c.relateCount} ${relate} </span>
                    <button class="btn-relate ${c.related ? 'related' : ''}"
                            onclick="toggleRelate(${c.id})">
                        ${c.related ? '✓ I Relate' : 'I Relate'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// ---------- Form ----------
document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();

    document.getElementById('complaintForm').addEventListener('submit', e => {
        e.preventDefault();

        const topic = document.getElementById('topic').value;
    const uni = document.getElementById('uni').value;
    const description = document.getElementById('description').value;


        if (!topic || !uni || !description) return;

        complaints.unshift({
            id: nextId++,
            topic,
            uni,
            description,
            date: new Date().toISOString().split('T')[0],
            relateCount: 1,
            related: false
        });

        saveComplaints();
        renderComplaints();
        e.target.reset();
        document.getElementById('complaints').scrollIntoView({ behavior: 'smooth' });
    });
});
