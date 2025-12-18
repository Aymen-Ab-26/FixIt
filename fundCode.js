let fundraisers = [];
let nextId = 1;
let currentFilter = 'all';

// Load fundraisers from browser storage
function loadFundraisers() {
    const stored = localStorage.getItem('fundraisers');
    const storedSupport = localStorage.getItem('userSupport');
    
    if (stored) {
        fundraisers = JSON.parse(stored);
        if (fundraisers.length > 0) {
            nextId = Math.max(...fundraisers.map(f => f.id)) + 1;
        }
        
        // Restore user's support
        if (storedSupport) {
            const support = JSON.parse(storedSupport);
            fundraisers.forEach(f => {
                f.supported = support[f.id] || false;
            });
        }
    } else {
        // Initialize with sample data
        fundraisers = [
            {
                id: 1,
                title: "Library AC System Repair",
                category: "Infrastructure",
                uni: "FST",
                description: "Raise funds to repair the library's air conditioning system. Current estimate from technicians is 2500 TND.",
                goal: 2500,
                raised: 1850,
                supporters: 47,
                date: "2025-12-15",
                supported: false
            },
            {
                id: 2,
                title: "Building C Bathroom Renovation",
                category: "Hygiene",
                uni: "ISTMT",
                description: "Complete overhaul of Building C bathrooms including new fixtures, proper ventilation, and regular cleaning supplies.",
                goal: 3500,
                raised: 2100,
                supporters: 89,
                date: "2025-12-14",
                supported: false
            },
            {
                id: 3,
                title: "Computer Lab Equipment",
                category: "Equipment",
                uni: "HIDE",
                description: "Purchase 10 new computers and upgrade existing machines in the 3rd floor lab to ensure all students have access.",
                goal: 5000,
                raised: 3200,
                supporters: 62,
                date: "2025-12-13",
                supported: false
            },
            {
                id: 4,
                title: "Student Wellness Week",
                category: "Events",
                uni: "FST",
                description: "Organize a week of mental health workshops, stress relief activities, and wellness resources for students during exam season.",
                goal: 1500,
                raised: 1420,
                supporters: 108,
                date: "2025-12-12",
                supported: false
            }
        ];
        nextId = 5;
    }
    
    renderFundraisers();
}

// Save fundraisers to browser storage
function saveFundraisers() {
    const dataToSave = fundraisers.map(f => ({
        id: f.id,
        title: f.title,
        category: f.category,
        uni: f.uni,
        description: f.description,
        goal: f.goal,
        raised: f.raised,
        supporters: f.supporters,
        date: f.date
    }));
    localStorage.setItem('fundraisers', JSON.stringify(dataToSave));
    
    // Save user support separately
    const support = {};
    fundraisers.forEach(f => {
        if (f.supported) support[f.id] = true;
    });
    localStorage.setItem('userSupport', JSON.stringify(support));
}

function renderFundraisers() {
    const fundraisersList = document.getElementById('fundraisersList');
    
    const filtered = currentFilter === 'all' 
        ? fundraisers 
        : fundraisers.filter(f => f.category === currentFilter);
    
    if (filtered.length === 0) {
        fundraisersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <p>No fundraisers in this category yet. Be the first to start one!</p>
            </div>
        `;
        return;
    }

    fundraisersList.innerHTML = filtered.map(fundraiser => {
        const progress = Math.min((fundraiser.raised / fundraiser.goal) * 100, 100);
        return `
            <div class="fundraiser-card">
                <div class="fundraiser-header">
                    <h3 class="fundraiser-title">${fundraiser.title}</h3>
                    <div class="fundraiser-meta">
                        <span class="fundraiser-category">${fundraiser.category}</span>
                        <span class="fundraiser-uni">${fundraiser.uni}</span>
                    </div>
                </div>
                <p class="fundraiser-description">${fundraiser.description}</p>
                <div class="progress-section">
                    <div class="progress-header">
                        <span class="amount-raised">${fundraiser.raised} TND</span>
                        <span class="goal-amount">of ${fundraiser.goal} TND</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="supporters-count">${fundraiser.supporters} ${fundraiser.supporters === 1 ? 'supporter' : 'supporters'}</span>
                </div>
                <div class="fundraiser-footer">
                    <button class="btn-donate" onclick="donate(${fundraiser.id})">Donate</button>
                    <button class="btn-support ${fundraiser.supported ? 'supported' : ''}" onclick="toggleSupport(${fundraiser.id})">
                        ${fundraiser.supported ? '✓ Supporting' : 'Support'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function donate(id) {
    const fundraiser = fundraisers.find(f => f.id === id);
    if (fundraiser) {
        const amount = prompt(`How much would you like to donate to "${fundraiser.title}"? (in TND)`);
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
            fundraiser.raised += parseFloat(amount);
            if (!fundraiser.supported) {
                fundraiser.supporters++;
                fundraiser.supported = true;
            }
            saveFundraisers();
            renderFundraisers();
            alert(`Thank you for donating ${amount} TND! 🎉`);
        }
    }
}

function toggleSupport(id) {
    const fundraiser = fundraisers.find(f => f.id === id);
    if (fundraiser) {
        if (fundraiser.supported) {
            fundraiser.supporters--;
            fundraiser.supported = false;
        } else {
            fundraiser.supporters++;
            fundraiser.supported = true;
        }
        saveFundraisers();
        renderFundraisers();
    }
}

function filterFundraisers(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderFundraisers();
}

document.addEventListener('DOMContentLoaded', function() {
    loadFundraisers();
    
    document.getElementById('fundraiserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const uni = document.getElementById('uni').value;
        const goal = parseFloat(document.getElementById('goal').value);
        const description = document.getElementById('description').value;
        
        if (title && category && uni && goal && description) {
            const newFundraiser = {
                id: nextId++,
                title: title,
                category: category,
                uni: uni,
                description: description,
                goal: goal,
                raised: 0,
                supporters: 0,
                date: new Date().toISOString().split('T')[0],
                supported: false
            };
            
            fundraisers.unshift(newFundraiser);
            saveFundraisers();
            renderFundraisers();
            
            // Reset form
            document.getElementById('fundraiserForm').reset();
            
            // Scroll to fundraisers
            document.getElementById('fundraisers').scrollIntoView({ behavior: 'smooth' });
            
            alert('Fundraiser created successfully! 🎉');
        }
    });
});