var maxHeight = 550;
var youDaoApi = 'https://m.youdao.com/dict?le=eng&q=';

utools.onPluginEnter(({ code, type, payload }) => {
    utools.setExpendHeight(0);
    if (code == 'search_word') {
        utools.setSubInput(({ text }) => {
            lookUp(text);
        }, '请输入需要查询的中英文内容');
        if (type == 'over') {
            utools.setSubInputValue(payload);
            lookUp(payload);
        }
    }
});

$(document).keydown(e => {
    switch (e.keyCode) {
        case 13:
            console.log(text);
            lookUp(text);
            break;
    }
});

async function lookUp(word) {
    let contentFather = $('.content');
    word = word.trim();
    if (word == '') {
        contentFather.html('');
        utools.setExpendHeight(0);
        return;
    }
    let url = youDaoApi + word;
    $.get(url, function (data) {
        contentFather.html('');
        let title = getTitle(word);
        contentFather.append(title);

        let phoneticDiv = getPhonetic(data);
        contentFather.append(phoneticDiv);

        let paraphraseDiv = getParaphrase(data);
        contentFather.append(paraphraseDiv);

        let translationDiv = getTranslation(data);
        contentFather.append(translationDiv);
        setHeight();
    });
}

function getTitle(word) {
    return $('<h1>' + word + '</h1>');
}

function getPhonetic(data) {
    //读音 英/美
    let regPhonetic = /英[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"[\W\w]*?美[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
    let phonetics = regPhonetic.exec(data);

    let phoneticDiv = $('<div class="phonetic"></div>');

    // 多个读音
    if (phonetics != null) {
        let keyEnSpan = $('<span>英 ' + phonetics[1] + '</span>');
        let keyUtSpan = $('<span>美 ' + phonetics[3] + '</span>');

        let audioEn = $('<audio></audio>');
        audioEn.attr('src', phonetics[2]);
        let audioUt = $('<audio></audio>');
        audioUt.attr('src', phonetics[4]);

        let btnEn = $('<button type="button"></button>');
        btnEn.append(audioEn);
        let btnUt = $('<button type="button"></button>');
        btnUt.append(audioUt);

        addListener(btnEn);
        addListener(btnUt);
        phoneticDiv.append(keyEnSpan);
        phoneticDiv.append(btnEn);
        phoneticDiv.append(keyUtSpan);
        phoneticDiv.append(btnUt);
    } else {
        // 单个读音
        regPhonetic = /phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
        phonetics = regPhonetic.exec(data);
        if (phonetics != null) {
            console.log(phonetics);
            let keySpan = $('<span>' + phonetics[1] + '</span>');
            let audio = $('<audio></audio>');
            audio.attr('src', phonetics[2]);
            let btn = $('<button type="button"></button>');
            btn.append(audio);
            addListener(btn);
            phoneticDiv.append(keySpan);
            phoneticDiv.append(btn);
        }
    }
    return phoneticDiv;
}

function addListener(element) {
    // Convert to HTML DOM.
    let btn = element[0];
    btn.onmouseover = function () {
        btn.children[0].play();
    };
}

function getParaphrase(data) {
    const regParaphrase = /_contentWrp"[\W\w]*<ul>([\W\w]*?)<\/ul/im;
    let paraphrases = regParaphrase.exec(data);
    let paraphraseDiv = $('<div></div>');
    if (paraphrases != null) {
        let paraphraseTitle = $('<h2>释义</h2>');
        let paraphraseList = $('<ul>' + filterATag(paraphrases[1]) + '</ul>');
        paraphraseDiv.append(paraphraseTitle);
        paraphraseDiv.append(paraphraseList);
    }
    return paraphraseDiv;
}

function filterATag(msg) {
    var msg = msg.replace(/<a[\W\w]*?>/gim, '');
    msg = msg.replace('</a>', '');
    return msg;
}

function getTranslation(data) {
    const regTranslation = /fanyi_contentWrp"[\W\w]*?翻译结果[\W\w]*?trans-container[\W\w]*?<p>[\W\w]*?<\/p>([\W\w]*?)<\/p>/im;
    let translations = regTranslation.exec(data);
    let translationDiv = $('<div></div>');
    if (translations != null) {
        let translationTitle = $('<h2>翻译</h2>');
        let translationList = $('<ul><li>' + translations[1] + '</li></ul>');
        translationDiv.append(translationTitle);
        translationDiv.append(translationList);
    }
    return translationDiv;
}

function setHeight() {
    let height = document.body.offsetHeight;
    height = height > maxHeight ? maxHeight : height;
    utools.setExpendHeight(height);
}
