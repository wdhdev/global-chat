module.exports = function replaceContent(string) {
    let content = string;

    // Replace symbols
    content = content.replace("!", "i");
    content = content.replace("@", "a");
    content = content.replace("#", "");
    content = content.replace("$", "s");
    content = content.replace("^", "u");
    content = content.replace("*", "");

    // Replace numbers
    content = content.replace("0", "o");
    content = content.replace("1", "i");
    content = content.replace("3", "e");
    content = content.replace("5", "s");

    return content;
}