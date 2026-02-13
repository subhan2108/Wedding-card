/**
 * suggestionService.js
 * Provides smart content suggestions and layout logic for the wedding editor.
 */

const THEMES = {
    ROMANTIC: {
        headers: [
            "Our Journey Begins",
            "Together Forever",
            "Love's Eternal Promise",
            "To Have and To Hold",
            "A True Love Story"
        ],
        bodies: [
            "We request the honor of your presence as we unite in marriage.",
            "Please join us as we celebrate our love and commitment.",
            "With joy in our hearts, we invite you to share this special day.",
            "Because you have shared in our lives, we invite you to share our joy."
        ]
    },
    MODERN: {
        headers: [
            "THE WEDDING",
            "M + S", // Dynamically replaceable
            "SAVETHE DATE",
            "LET'S DO THIS",
            "WE'RE GETTING MARRIED"
        ],
        bodies: [
            "Eat, drink, and be married! Join us for a night of celebration.",
            "We're making it official! Be there as we say 'I Do'.",
            "See you at the wedding of the century.",
            "No excuses! We want you there for the big day."
        ]
    },
    TRADITIONAL: {
        headers: [
            "Marriage Celebration",
            "Wedding Invitation",
            "Solemnization of Matrimony",
            "The Union of Two Families"
        ],
        bodies: [
            "Mr. and Mrs. [Lastname] request the pleasure of your company.",
            "You are cordially invited to witness the exchange of vows.",
            "Celebrating the holy bond of matrimony."
        ]
    }
};

export const suggestionService = {
    getSuggestions(theme = 'ROMANTIC') {
        return THEMES[theme] || THEMES.ROMANTIC;
    },

    getRandomSuggestion(type, theme = 'ROMANTIC') {
        const pool = THEMES[theme][type] || THEMES.ROMANTIC[type];
        return pool[Math.floor(Math.random() * pool.length)];
    },

    /**
     * Auto Layout: Tidy the design
     * - Centers all layers horizontally
     * - Spaces layers vertically with a consistent gap
     */
    tidyLayout(layers, canvasWidth, canvasHeight) {
        if (!layers.length) return layers;

        // Group by type or just sort all by current Y
        const sortedLayers = [...layers].sort((a, b) => a.y - b.y);

        const totalLayers = sortedLayers.length;
        const totalHeight = sortedLayers.reduce((acc, l) => acc + (l.fontSize || 20), 0);
        const gap = 30; // Vertical gap between elements

        const contentHeight = totalHeight + (gap * (totalLayers - 1));
        let currentY = (canvasHeight - contentHeight) / 2 + (sortedLayers[0].fontSize || 24);

        return sortedLayers.map((layer, index) => {
            const newLayer = {
                ...layer,
                x: canvasWidth / 2, // Horizontally centered
                y: currentY,
                textAlign: 'center'
            };

            // Advance Y for next layer
            if (index < totalLayers - 1) {
                currentY += (layer.fontSize || 24) + gap;
            }

            return newLayer;
        });
    }
};
