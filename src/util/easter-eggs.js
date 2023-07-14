module.exports = async function (content) {
    // andrew w
    if(content.toLowerCase() === "andrew w") {
        return "Andrew is the best developer 💯";
    }

    // ethereal
    if(content.toLowerCase() === "ethereal") {
        return "Ethereal should get $10";
    }

    // fml
    if(content.toLowerCase() === "fml") {
        return "Free my life, free my losses! I want to live!";
    }

    // help me
    if(content.toLowerCase() === "help me") {
        return "William is keeping me in his basement and is feeding me strawberries";
    }

    // kys
    if(content.toLowerCase() === "kys") {
        return "I love you so much and I wish you the best in life! 🥰";
    }

    // luni better
    if(content.toLowerCase() === "luni better") {
        return "Luni = best moderator";
    }

    // OwO
    if(content === "OwO") {
        return "OwO What's This?";
    }

    // the duck song
    if(content.toLowerCase() === "the duck song") {
        return "A duck walked up to a lemonade stand and he said to the man running the stand \"Hey! Got any grapes?\"";
    }

    // uwu
    if(content.toLowerCase() === "uwu") {
        return "I am a degenerate anime watcher with no life.";
    }

    return content;
}
