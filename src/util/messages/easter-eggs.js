module.exports = async function (content) {
    // kys
    if(content.toLowerCase() === "kys") {
        return "I love you so much and I wish you the best in life! 🥰";
    }

    // uwu
    if(content.toLowerCase() === "uwu") {
        return "I am a degenerate anime watcher with no life.";
    }

    return content;
}
