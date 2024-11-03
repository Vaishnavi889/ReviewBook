document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const bookQueryInput = document.getElementById('book-query');
    const bookResults = document.getElementById('book-results');

    // Show only the home section by default
    showSection('home');

    // Add click event listeners for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('data-target');
            showSection(targetId);
        });
    });

    // Search button event listener
    searchButton.addEventListener('click', async () => {
        const query = bookQueryInput.value;

        if (!query) {
            bookResults.innerHTML = 'Please enter a book title.';
            return;
        }

        try {
            const response = await fetch(`/api/books?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const book = data.items[0].volumeInfo;
                const reviews = book.description || 'No description available.';
                const title = book.title || 'Unknown title';
                const authors = book.authors ? book.authors.join(', ') : 'Unknown authors';
                const rating = Math.floor(Math.random() * 5) + 1; // Simulating a random rating
                const userReviews = getReviews(title); // Fetching mock reviews
                
                // Fetch similar books
                const similarBooks = await fetchSimilarBooks(book.categories || []);

                bookResults.innerHTML = `
                    <div class="book-details">
                        <h2>${title}</h2>
                        <p>Author(s): ${authors}</p>
                        <p class="rating">Rating: ${rating} / 5</p>
                        <p>${reviews}</p>
                    </div>
                    <div class="review-section">
                        <h3>User Reviews</h3>
                        <ul>${userReviews}</ul>
                    </div>
                    <div class="recommendations">
                        <h3>Recommending Similar Books:</h3>
                        <ul>${similarBooks}</ul>
                    </div>
                `;
            } else {
                bookResults.innerHTML = 'No results found.';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            bookResults.innerHTML = 'There was an error fetching the results. Please try again later.';
        }
    });

    // Handle contact form submission
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for reaching out! We will get back to you soon.');
        document.getElementById('contact-form').reset();
    });

    // Handle feedback form submission
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your feedback!');
        document.getElementById('feedback-form').reset();
    });
});

// Function to show the selected section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Function to get simulated user reviews
function getReviews(bookTitle) {
    const reviews = {
        "The Kite Runner": [
            "A powerful story of friendship and redemption.",
            "An emotional rollercoaster that stayed with me long after I finished.",
            "Beautifully written, a must-read for everyone."
        ],
        "Pride and Prejudice": [
            "A timeless classic that explores love and societal expectations.",
            "Jane Austen's wit and humor shine through in every chapter.",
            "An engaging read with unforgettable characters."
        ],
        // Add more books and reviews as needed
    };

    const bookReviews = reviews[bookTitle] || ["No reviews available for this book."];
    return bookReviews.map(review => `<li>${review}</li>`).join('');
}

// Function to fetch similar books based on category
async function fetchSimilarBooks(categories) {
    if (!categories || categories.length === 0) return "<li>No similar books found.</li>";

    const category = categories[0]; // Taking the first category for simplicity
    try {
        const response = await fetch(`/api/books?query=${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const similarBooks = data.items
            .filter((item) => item.volumeInfo.title !== categories[0]) // Exclude the original book
            .map((item) => `<li>${item.volumeInfo.title} by ${item.volumeInfo.authors.join(', ')}</li>`)
            .slice(0, 5) // Limiting to 5 recommendations
            .join('');
        return similarBooks || "<li>No similar books found.</li>";
    } catch (error) {
        console.error('Error fetching similar books:', error);
        return "<li>Error fetching similar books.</li>";
    }
}
