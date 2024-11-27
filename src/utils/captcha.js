// utils/captcha.js
const { MessageAttachment } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports.createCaptcha = async () => {
    // Create a new canvas (200x70px)
    const canvas = createCanvas(200, 70);
    const ctx = canvas.getContext('2d');

    // Generate a random simple math question (you can customize this part)
    const questions = [
        { question: 'What is 3 + 2?', answer: '5' },
        { question: 'What is 6 - 1?', answer: '5' },
        { question: 'What is 9 / 3?', answer: '3' },
        { question: 'What is 5 + 4?', answer: '9' },
        { question: 'What is 8 - 3?', answer: '5' }
    ];

    const captcha = questions[Math.floor(Math.random() * questions.length)];

    // Set background and text properties
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 200, 70); // Background color
    ctx.fillStyle = '#000000';
    ctx.font = '30px Arial';
    ctx.fillText(captcha.question, 20, 40); // Draw the question on the canvas

    // Create an image attachment
    const attachment = new MessageAttachment(canvas.toBuffer(), 'captcha.png');

    // Return the file and the correct answer
    return { file: attachment, answer: captcha.answer };
};
