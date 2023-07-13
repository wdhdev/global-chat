module.exports = async function (content) {
    // fml
    if(content.toLowerCase() === "fml") {
        return "Free my life, free my losses! I want to live!";
    }

    // kys
    if(content.toLowerCase() === "kys") {
        return "I love you so much and I wish you the best in life! 🥰";
    }

    // OwO
    if(content === "OwO") {
        return "OwO What's This?";
    }

    // uwu
    if(content.toLowerCase() === "uwu") {
        return "I am a degenerate anime watcher with no life.";
    }

    return content;
}
