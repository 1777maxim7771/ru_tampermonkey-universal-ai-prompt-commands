// ==UserScript==
// @name         Tampermonkey Universal AI Prompt Commands RU
// @namespace    local.tampermonkey.universal.ai.prompt.commands.ru
// @version      1.1.0
// @description  Русская версия: заменяет универсальные триггеры Q1-Q10 на готовые AI-промпты для быстрого ввода в AI-чатах
// @author       1777maxim7771
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    /*
        Tampermonkey Universal AI Prompt Commands RU

        Назначение:
        Скрипт помогает быстрее работать с AI-чатами: ChatGPT, Gemini, Claude, Copilot и другими сайтами с полем ввода.
        Он заменяет короткие универсальные триггеры Q1-Q10 на заранее подготовленные длинные промпты.

        Важно:
        Триггеры Q1-Q10 не привязаны к языку. Пользователь может изменить их на любые свои команды, слова или фразы.
        Замена срабатывает только при точном совпадении всего текста поля с триггером.
    */

    const COMMANDS = {
        'Q1': `Сделай полный и точный перевод предоставленного текста на русский язык.
Сохрани смысл, порядок информации, имена, даты, суммы, номера документов, названия организаций и важные формулировки.
Если есть официальные или юридические выражения, переведи их понятно, но без искажения смысла.
Не добавляй собственные выводы, не сокращай текст и не меняй содержание.`,

        'Q2': `Подытожь предоставленный текст на русском языке по смыслу и контексту.
Укажи, о чем текст, кто кому пишет или сообщает, по какому вопросу, что является главным содержанием, какие требования, просьбы, решения, даты, сроки, суммы или важные детали указаны.
Пиши простым и понятным языком без лишних рассуждений.`,

        'Q3': `Сделай краткое тематическое резюме письма на русском языке строго в одну строку.
В одной строке укажи: от кого письмо, по какому вопросу, что сообщается или требуется, какие важные даты, сроки, суммы, документы или действия упоминаются.`,

        'Q4': `Переведи предоставленный текст на простой и понятный немецкий язык уровня A2-B1.
Сделай текст вежливым, официальным и грамматически правильным.
Сохрани исходный смысл, даты, имена, суммы, адреса, названия организаций и важные детали.
Не используй слишком сложные немецкие формулировки.`,

        'Q5': `Исправь предоставленный русский текст.
Сделай его грамотным, понятным и логичным, но сохрани исходный смысл.
Убери ошибки, повторения, неудачные формулировки и слишком разговорные места.
Если текст предназначен для письма, сделай его более вежливым и официальным.
Не добавляй фактов, которых нет в исходном тексте.`,

        'Q6': `Напиши короткий, вежливый и официальный ответ на это письмо на русском языке.
Ответ должен быть понятным и по существу, без лишних фраз.
Если нужно подтвердить получение, уточнить документы, попросить разъяснение или сообщить информацию, сформулируй это корректно.
В конце добавь вежливое завершение.`,

        'Q7': `Объясни простыми словами на русском языке, что означает этот текст.
Разбери смысл по контексту: кто пишет, по какому вопросу, что хотят, что нужно сделать, какие сроки, даты, суммы, документы или условия важны.
Отдельно укажи, есть ли в тексте требование, предупреждение, просьба, решение или просто информация.`,

        'Q8': `Извлеки из предоставленного текста все важные факты и структурируй их на русском языке.
Отдельно укажи: имена людей, организации, адреса, даты, сроки, суммы, номера документов, требования, решения, обязательства, упомянутые документы и дальнейшие действия.
Не придумывай данные, которых нет в тексте. Если информации нет, напиши: не указано.`,

        'Q9': `Составь на русском языке понятный список действий, которые нужно выполнить на основании этого текста.
Определи, что требуется сделать, какие документы подготовить, кому ответить, куда обратиться, какие сроки соблюдать и на что обратить внимание.
Раздели действия по приоритету: срочно, важно, можно позже.`,

        'Q10': `Сделай на основе предоставленного текста вежливое официальное письмо на немецком языке.
Письмо должно быть простым, понятным и корректным, уровень A2-B1.
Сохрани все важные факты: имена, даты, суммы, адреса, названия организаций, номера документов и обстоятельства.
Структура письма: обращение, краткое объяснение ситуации, основная просьба или сообщение, при необходимости просьба о подтверждении или разъяснении, завершение.
В конце добавь: Mit freundlichen Grüßen`
    };

    const EDITABLE_SELECTORS = [
        'textarea',
        'input[type="text"]',
        'input[type="search"]',
        '[contenteditable="true"]',
        '[contenteditable="plaintext-only"]',
        '[role="textbox"]'
    ];

    function isEditableElement(element) {
        if (!element || !element.matches) return false;
        if (element.disabled || element.readOnly) return false;

        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const inputType = (element.getAttribute('type') || '').toLowerCase();

        if (tagName === 'input' && !['text', 'search'].includes(inputType)) return false;

        return EDITABLE_SELECTORS.some(selector => element.matches(selector));
    }

    function findEditableElement(target) {
        if (!target) return null;
        if (isEditableElement(target)) return target;
        if (target.closest) {
            const element = target.closest(EDITABLE_SELECTORS.join(','));
            if (isEditableElement(element)) return element;
        }
        return null;
    }

    function getText(element) {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        if (tagName === 'textarea' || tagName === 'input') return element.value || '';
        return element.innerText || element.textContent || '';
    }

    function normalizeCommand(text) {
        return String(text || '').trim().replace(/\s+/g, '').toUpperCase();
    }

    function setCursorToEnd(element) {
        element.focus();
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        if (tagName === 'textarea' || tagName === 'input') {
            const length = element.value.length;
            element.setSelectionRange(length, length);
            return;
        }
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function dispatchInputEvents(element, text) {
        try {
            element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertReplacementText', data: text }));
        } catch (error) {
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function replaceText(element, newText) {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        element.focus();

        if (tagName === 'textarea' || tagName === 'input') {
            element.value = newText;
            setCursorToEnd(element);
            dispatchInputEvents(element, newText);
            return;
        }

        try {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('insertText', false, newText);
        } catch (error) {
            element.textContent = newText;
        }

        setCursorToEnd(element);
        dispatchInputEvents(element, newText);
    }

    function showNotification(message) {
        const oldBox = document.getElementById('tampermonkey-universal-ai-prompt-commands-notification');
        if (oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.id = 'tampermonkey-universal-ai-prompt-commands-notification';
        box.textContent = message;
        box.style.position = 'fixed';
        box.style.right = '20px';
        box.style.bottom = '20px';
        box.style.zIndex = '999999';
        box.style.background = '#111';
        box.style.color = '#fff';
        box.style.padding = '12px 18px';
        box.style.borderRadius = '10px';
        box.style.fontSize = '14px';
        box.style.fontFamily = 'Arial, sans-serif';
        box.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 2200);
    }

    function checkAndReplace(target) {
        const editable = findEditableElement(target);
        if (!editable) return;

        const command = normalizeCommand(getText(editable));
        if (!Object.prototype.hasOwnProperty.call(COMMANDS, command)) return;

        replaceText(editable, COMMANDS[command]);
        showNotification(`Триггер ${command} заменён на готовый AI-промпт`);
    }

    document.addEventListener('input', event => setTimeout(() => checkAndReplace(event.target), 20), true);
    document.addEventListener('keyup', event => setTimeout(() => checkAndReplace(event.target), 20), true);
    document.addEventListener('paste', event => setTimeout(() => checkAndReplace(event.target), 50), true);
})();