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

    // never gonna give you up
    if(content.toLowerCase() === "never gonna give you up") {
        return "Never gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you";
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
