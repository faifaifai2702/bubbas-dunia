// --- STATE MANAGEMENT ---
let state = {
    venues: [], // This will be filled with data from data.json
    selectedVenueId: null,
    searchTerm: '',
    category: 'All',
    activeFilters: [],
};

const allTagFilters = ['Playground', 'Halal', 'Changing Tables', 'Stroller Friendly', 'Indoor Play Area', 'Water Play', 'Petting Zoo', 'Educational', 'Theme Park', 'Adventure'];
const app = document.getElementById('app');

// --- RENDER FUNCTIONS ---
function render() {
    if (state.selectedVenueId) {
        const venue = state.venues.find(v => v.id === state.selectedVenueId);
        if (venue) {
            app.innerHTML = renderVenueDetailsPage(venue);
        } else {
            state.selectedVenueId = null;
            renderMainPageStructure();
        }
    } else {
        renderMainPageStructure();
    }
    addEventListeners();
}

function renderMainPageStructure() {
    app.innerHTML = `
        <header class="p-6 text-center">
            <h1 class="text-5xl text-slate-800 font-extrabold">Bubba's Dunia</h1>
            <p class="text-slate-500 mt-1 italic">It's their world, we're just living in it</p>
        </header>
        <main>
            <section class="text-center pt-12 pb-16 md:pt-20 md:pb-24 px-4">
                <h2 class="text-3xl md:text-5xl font-bold mb-4 leading-tight">Find Your Family's Next<br/>Adventure in Malaysia</h2>
                <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8">Discover amazing kid-friendly restaurants & parks near you.</p>
                <div class="max-w-xl mx-auto mb-6">
                    <div class="relative">
                        <input id="search-input" type="text" placeholder="Search by name or location, e.g., 'Bangsar'" class="w-full py-4 px-6 pr-12 rounded-full border-2 border-slate-200 focus:outline-none focus:border-teal-400 transition-all duration-300" value="${state.searchTerm}" />
                    </div>
                </div>
                <div class="flex justify-center gap-4">
                    <button data-category="All" class="category-btn font-bold py-3 px-8 rounded-full shadow-lg transition-colors ${state.category === 'All' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}">Show All</button>
                    <button data-category="Restaurant" class="category-btn font-bold py-3 px-8 rounded-full shadow-lg transition-colors ${state.category === 'Restaurant' ? 'bg-pink-400 text-white' : 'bg-white text-slate-800'}">Restaurants</button>
                    <button data-category="Park" class="category-btn font-bold py-3 px-8 rounded-full shadow-lg transition-colors ${state.category === 'Park' ? 'bg-teal-400 text-white' : 'bg-white text-slate-800'}">Parks</button>
                </div>
            </section>
            <section id="search-results" class="py-12 md:py-20 bg-white">
                <!-- Results will be rendered here -->
            </section>
        </main>
        <footer class="text-center p-8 text-slate-500 bg-white mt-12">
            <p>&copy; 2025 Bubba's Dunia. Made with ❤️ for Malaysian families.</p>
        </footer>
    `;
    renderResults();
    addEventListeners();
}

function renderResults() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    const filteredVenues = state.venues.filter(venue => {
        if (state.category !== 'All' && venue.type !== state.category) return false;
        if (state.searchTerm && !venue.name.toLowerCase().includes(state.searchTerm.toLowerCase()) && !venue.location.toLowerCase().includes(state.searchTerm.toLowerCase())) return false;
        if (state.activeFilters.length > 0 && !state.activeFilters.every(filter => venue.tags.includes(filter))) return false;
        return true;
    });

    resultsContainer.innerHTML = `
        <div class="max-w-6xl mx-auto px-4">
            <h3 class="text-2xl md:text-3xl font-bold text-center mb-4">${filteredVenues.length > 0 ? `Showing ${filteredVenues.length} Results` : 'No Results Found'}</h3>
            <div class="flex flex-wrap justify-center gap-3 mb-12">
                ${allTagFilters.map(filter => `<button data-filter="${filter}" class="filter-btn py-2 px-5 rounded-full font-semibold transition-all duration-200 ${state.activeFilters.includes(filter) ? 'bg-slate-700 text-white transform -translate-y-0.5 shadow-md' : 'bg-slate-200 text-slate-700'}">${filter}</button>`).join('')}
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${filteredVenues.map(venue => renderVenueCard(venue)).join('')}
            </div>
        </div>
    `;
    addResultEventListeners();
}


function renderVenueCard(venue) {
    return `
        <div data-venue-id="${venue.id}" class="venue-card cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 flex flex-col">
            <img src="${venue.imageUrl.replace('1200x600', '600x400')}" alt="${venue.name}" class="w-full h-48 object-cover" />
            <div class="p-6 flex-grow flex flex-col">
                <span class="text-sm font-semibold text-white py-1 px-3 rounded-full self-start ${venue.type === 'Park' ? 'bg-teal-400' : 'bg-pink-400'}">${venue.type}</span>
                <h4 class="font-bold text-xl mt-2">${venue.name}</h4>
                <div class="flex items-center text-sm text-gray-500 mb-2">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                    <span>${venue.location}</span>
                </div>
                <div class="flex items-center my-2">
                     <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span class="text-gray-700 font-bold text-sm ml-1">${venue.rating}</span>
                    <span class="text-gray-500 text-sm ml-2">(${venue.reviews} reviews)</span>
                </div>
                <p class="text-gray-600 text-sm mb-4 flex-grow">${venue.description}</p>
            </div>
        </div>
    `;
}

function renderVenueDetailsPage(venue) {
     return `
        <div class="bg-white">
            <header class="relative">
                <img src="${venue.imageUrl}" alt="${venue.name}" class="w-full h-64 md:h-96 object-cover" />
                <button id="back-btn" class="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full p-3 shadow-md hover:bg-white transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
            </header>
            <div class="p-6 md:p-8 max-w-4xl mx-auto">
                <span class="text-sm font-semibold text-white py-1 px-3 rounded-full self-start ${venue.type === 'Park' ? 'bg-teal-400' : 'bg-pink-400'}">${venue.type}</span>
                <h1 class="text-4xl md:text-5xl font-bold text-slate-800 mt-2">${venue.name}</h1>
                <div class="flex items-center text-md text-gray-500 my-3">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                    <span>${venue.address}</span>
                </div>
                <div class="py-6 border-t border-b border-gray-200">
                    <h3 class="text-xl font-bold mb-4">Amenities</h3>
                    <div class="flex flex-wrap gap-4 text-sm">
                        ${venue.tags.map(tag => `<span class="bg-slate-200 rounded-full px-4 py-2">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="py-6 grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-xl font-bold mb-4">Plan Your Visit</h3>
                        <p><strong>Hours:</strong> ${venue.hours}</p>
                        ${venue.contact.phone ? `<p><strong>Phone:</strong> <a href="tel:${venue.contact.phone}" class="text-blue-600 hover:underline">${venue.contact.phone}</a></p>` : ''}
                        ${venue.contact.googleMapsUrl ? `<a href="${venue.contact.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="mt-4 inline-flex items-center justify-center w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors shadow-lg"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg> Open in Google Maps</a>` : ''}
                        <div class="flex items-center gap-4 mt-4 text-gray-600">
                            ${venue.contact.website ? `<a href="${venue.contact.website}" class="hover:text-slate-800"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 22.621l-3.521-6.795c-1.614.938-3.483 1.504-5.479 1.504-6.627 0-11-5.373-11-12s4.373-12 11-12 11 5.373 11 12c0 1.203-.183 2.348-.506 3.422l3.521 6.795-.016.016zM11 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c1.769 0 3.438-.463 4.878-1.288l.002.002-2.88-5.562-3.5 1.842-3-5.5-3.5 1.842-1.5-2.75 3.5-1.842 3 5.5 3.5-1.842 3 5.5 1.5-2.75-3.5-1.842-1.921-3.709c1.238-1.169 2-2.803 2-4.625z"/></svg></a>` : ''}
                            ${venue.contact.facebook ? `<a href="${venue.contact.facebook}" class="hover:text-slate-800"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.03998c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-8.414v3.414h2v-3.414c0-.552.447-1 1-1h1.414v-2h-1.414c-1.654 0-3 1.346-3 3zm4-3.586h-2v-2h2v2z"/></svg></a>` : ''}
                            ${venue.contact.instagram ? `<a href="${venue.contact.instagram}" class="hover:text-slate-800"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.585.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg></a>` : ''}
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold mb-4">What Parents Are Saying</h3>
                        ${venue.userReviews.length > 0 ? venue.userReviews.map(review => `<div class="mb-4 bg-sky-50 p-4 rounded-lg"><p class="italic">"${review.comment}"</p><p class="text-right font-bold text-sm mt-2">- ${review.name}</p></div>`).join('') : '<p class="text-gray-500">No reviews yet.</p>'}
                        <div class="mt-8">
                            <h3 class="text-xl font-bold mb-4">Share Your Experience</h3>
                            <div class="bg-sky-50 p-6 rounded-lg">
                                <div class="mb-4">
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input type="text" id="name" class="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Sarah L." />
                                </div>
                                <div class="mb-4">
                                    <label for="comment" class="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                    <textarea id="comment" rows="4" class="w-full p-2 border border-gray-300 rounded-md" placeholder="What did you think?"></textarea>
                                </div>
                                <button class="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors shadow-lg">Submit Review</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- EVENT LISTENERS ---
function addEventListeners() {
    document.getElementById('search-input')?.addEventListener('input', e => {
        state.searchTerm = e.target.value;
        renderResults();
    });
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.category = btn.dataset.category;
            render();
        });
    });
    document.getElementById('back-btn')?.addEventListener('click', () => {
        state.selectedVenueId = null;
        render();
    });
    addResultEventListeners(); // Call this to add listeners to the initial results
}

function addResultEventListeners() {
     document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (state.activeFilters.includes(filter)) {
                state.activeFilters = state.activeFilters.filter(f => f !== filter);
            } else {
                state.activeFilters.push(filter);
            }
            renderResults();
        });
    });
    document.querySelectorAll('.venue-card').forEach(card => {
        card.addEventListener('click', () => {
            state.selectedVenueId = parseInt(card.dataset.venueId);
            render();
        });
    });
}

// --- INITIAL LOAD ---
async function init() {
    try {
        const response = await fetch('data.json');
        state.venues = await response.json();
        render();
    } catch (error) {
        console.error("Could not load venue data:", error);
        app.innerHTML = `<p class="text-center text-red-500">Error: Could not load venue data. Please make sure data.json is in the same folder and you are using a live server.</p>`;
    }
}

init();

