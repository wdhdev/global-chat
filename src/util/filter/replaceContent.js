module.exports = function replaceContent(string) {
    let content = string.toLowerCase();

    // Replace unicode look-alikes
    // a
    content = content.replace("а", "a");
    content = content.replace("ạ", "a");
    content = content.replace("ą", "a");
    content = content.replace("ä", "a");
    content = content.replace("à", "a");
    content = content.replace("á", "a");
    content = content.replace("ą", "a");

    // c
    content = content.replace("с", "c");
    content = content.replace("ƈ", "c");
    content = content.replace("ċ", "c");

    // d
    content = content.replace("ԁ", "d");
    content = content.replace("ɗ", "d");

    // e
    content = content.replace("е", "e");
    content = content.replace("ẹ", "e");
    content = content.replace("ė", "e");
    content = content.replace("é", "e");
    content = content.replace("é", "è");

    // g
    content = content.replace("ġ", "g");

    // h
    content = content.replace("һ", "h");

    // i
    content = content.replace("і", "i");
    content = content.replace("í", "i");
    content = content.replace("í", "i");

    // j
    content = content.replace("ј", "j");
    content = content.replace("ʝ", "j");

    // k
    content = content.replace("κ", "k");

    // l
    content = content.replace("ӏ", "l");
    content = content.replace("ḷ", "l");

    // n
    content = content.replace("ո", "n");

    // o
    content = content.replace("о", "o");
    content = content.replace("ο", "o");
    content = content.replace("օ", "o");
    content = content.replace("ȯ", "o");
    content = content.replace("ọ", "o");
    content = content.replace("ỏ", "o");
    content = content.replace("ơ", "o");
    content = content.replace("ó", "o");
    content = content.replace("ò", "o");
    content = content.replace("ö", "o");

    // p
    content = content.replace("р", "p");

    // q
    content = content.replace("զ", "q");

    // s
    content = content.replace("ʂ", "s");

    // u
    content = content.replace("υ", "u");
    content = content.replace("ս", "u");
    content = content.replace("ü", "u");
    content = content.replace("ú", "u");
    content = content.replace("ù", "u");

    // v
    content = content.replace("ν", "v");
    content = content.replace("ѵ", "v");

    // x
    content = content.replace("х", "x");
    content = content.replace("ҳ", "x");

    // y
    content = content.replace("у", "y");
    content = content.replace("ý", "y");

    // z
    content = content.replace("ʐ", "z");
    content = content.replace("ż", "z");

    // Replace symbols
    content = content.replace("!", "i");
    content = content.replace("@", "a");
    content = content.replace("#", "");
    content = content.replace("$", "s");
    content = content.replace("^", "u");
    content = content.replace("*", "");
    content = content.replace("-", "");

    // Replace numbers
    content = content.replace("0", "o");
    content = content.replace("1", "i");
    content = content.replace("3", "e");
    content = content.replace("5", "s");

    return content;
}