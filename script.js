class EnhancedMLFeatures {
    constructor() {
        this.readingPatterns = [];
        this.scrollPatterns = [];
        this.dwellTimes = new Map();
        this.lastScrollPos = window.scrollY;
        this.lastScrollTime = Date.now();
        this.emotionalKeywords = {
            wonder: ['inspiration', 'dreams', 'pride', 'hope'],
            nostalgia: ['heritage', 'tradition', 'wisdom', 'roots'],
            progress: ['innovation', 'technology', 'future', 'growth'],
            identity: ['community', 'culture', 'legacy', 'spirit']
        };
        this.paragraphThemes = new Map();
    }

    analyzeSentiment(text) {
        let emotionalProfile = {
            wonder: 0,
            nostalgia: 0,
            progress: 0,
            identity: 0
        };

        const words = text.toLowerCase().split(' ');
        
        Object.entries(this.emotionalKeywords).forEach(([emotion, keywords]) => {
            keywords.forEach(keyword => {
                const count = words.filter(word => word.includes(keyword)).length;
                emotionalProfile[emotion] += count;
            });
        });

        const total = Object.values(emotionalProfile).reduce((a, b) => a + b, 0);
        if (total === 0) return null;

        Object.keys(emotionalProfile).forEach(key => {
            emotionalProfile[key] = emotionalProfile[key] / total;
        });

        return emotionalProfile;
    }

    analyzeReadingEngagement() {
        const visibleParagraphs = Array.from(document.querySelectorAll('.paragraph'))
            .filter(p => {
                const rect = p.getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            });

        visibleParagraphs.forEach(p => {
            const dwellTime = this.dwellTimes.get(p.id) || 0;
            const sentiment = this.analyzeSentiment(p.textContent);
            if (sentiment) {
                this.paragraphThemes.set(p.id, {
                    sentiment,
                    engagement: dwellTime
                });
            }
        });

        return this.generateInsights();
    }

    generateInsights() {
        const insights = [];
        let totalEngagement = 0;
        let dominantThemes = new Map();

        this.paragraphThemes.forEach((data, id) => {
            totalEngagement += data.engagement;
            Object.entries(data.sentiment).forEach(([theme, value]) => {
                dominantThemes.set(theme, (dominantThemes.get(theme) || 0) + value * data.engagement);
            });
        });

       
        const sortedThemes = Array.from(dominantThemes.entries())
            .sort(([, a], [, b]) => b - a);

        if (sortedThemes.length > 0) {
            const primaryTheme = sortedThemes[0][0];
            const secondaryTheme = sortedThemes[1] ? sortedThemes[1][0] : null;

            insights.push({
                title: 'Reading Pattern',
                content: `Your reading shows strong engagement with ${primaryTheme}${secondaryTheme ? ` and ${secondaryTheme}` : ''} themes in the narrative.`
            });

            
            const themeInsights = {
                wonder: "You seem drawn to Bengaluru's inspiring scientific achievements",
                nostalgia: "The city's historical evolution appears to resonate with you",
                progress: "The technological advancement narrative captures your attention",
                identity: "You connect with Bengaluru's unique cultural identity"
            };

            insights.push({
                title: 'Key Interest',
                content: themeInsights[primaryTheme]
            });
        }

        return insights;
    }

    updateDwellTime(elementId) {
        if (!this.dwellTimes.has(elementId)) {
            this.dwellTimes.set(elementId, 0);
        }
        this.dwellTimes.set(elementId, this.dwellTimes.get(elementId) + 1);
        
      
        this.updateInsightsDisplay();
    }

    updateInsightsDisplay() {
        const insights = this.generateInsights();
        const container = document.getElementById('insights-content');
        
        if (insights.length > 0) {
            container.innerHTML = insights.map(insight => `
                <div class="insight-card">
                    <strong>${insight.title}</strong>
                    <p>${insight.content}</p>
                    <div class="engagement-meter">
                        <div class="meter-bar">
                            <div class="meter-fill" style="width: ${Math.random() * 100}%"></div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

const mlFeatures = new EnhancedMLFeatures();


function updateReadingProgress() {
    const progress = document.querySelector('.reading-progress');
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / totalHeight);
    progress.style.transform = `scaleX(${scrolled})`;
}


const paragraphs = document.querySelectorAll('.paragraph');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            
            const sentiment = mlFeatures.analyzeSentiment(entry.target.textContent);
            updateSentimentIndicator(sentiment);
            
           
            mlFeatures.updateDwellTime(entry.target.id);
        }
    });
}, { threshold: 0.5 });


paragraphs.forEach((p, i) => {
    p.id = `p${i}`;
    observer.observe(p);
});

window.addEventListener('scroll', () => {
    updateReadingProgress();
    const insights = mlFeatures.analyzeScrollPattern();
    if (insights) {
        updateHighlights(insights);
    }
});


function updateSentimentIndicator(sentiment) {
    const indicator = document.querySelector('.sentiment-indicator');
    indicator.style.opacity = '1';
    indicator.textContent = `Reading engagement: ${sentiment > 0 ? 'High' : 'Moderate'}`;
}

function updateHighlights(insights) {
    const container = document.querySelector('.highlight-container');
    if (insights.engagement === 'high') {
        container.style.display = 'block';
        const engagingContent = mlFeatures.getHighlightedContent();
        if (engagingContent.length > 0) {
            container.querySelector('p').textContent = 
                `You seem interested in sections about: ${engagingContent.join(', ')}`;
        }
    }
}



// Progress bar
const progressBar = document.querySelector('.progress-bar');
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.transform = `scaleX(${scrolled / 100})`;
});

// Scroll to top button
const scrollIndicator = document.querySelector('.scroll-indicator');
window.addEventListener('scroll', () => {
    scrollIndicator.style.opacity = window.scrollY > 100 ? '1' : '0';
});

scrollIndicator.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer1 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe paragraphs and notes
document.querySelectorAll('.paragraph, .image-note').forEach(el => {
    observer1.observe(el);
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Animate stamp and signature
anime({
    targets: '.stamp',
    opacity: [0, 1],
    scale: [0.5, 1],
    rotate: [0, 15],
    duration: 1000,
    easing: 'easeOutElastic(1, .5)',
    delay: 500
});

anime({
    targets: '.signature',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    easing: 'easeOutQuad',
    delay: 1000
});

setInterval(() => {
    mlFeatures.analyzeReadingEngagement();
}, 1000);