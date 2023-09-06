// Create the observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            // entry.target.classList.remove('visible');
        }
    });
});

// Tell the observer which elements to track
document.querySelectorAll('.when-visible').forEach(e => {
    observer.observe(e)
})