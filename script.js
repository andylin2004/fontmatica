import opentype from 'opentype.js';
import '98.css';

let amplitude_val = 0;
let direction = 'down-up';
let text_to_display = "sus";
let animation_style = 'none';

window.addEventListener('DOMContentLoaded', () => {
    const animation_style_box = document.getElementById('animation-style');
    const animation_direction = document.getElementById('animation-direction');

    const amplitude_box = document.getElementById('amplitude');
    const amplitude_num_input = document.querySelector('#amplitude #range-num');
    const amplitude_slider_input = document.querySelector('#amplitude #range-slider');

    const text_to_display_input = document.getElementById('display-text');
    const canvas = document.getElementById('draw-canvas').getContext('2d');

    function update_amplitude_values() {
        amplitude_num_input.value = amplitude_val;
        amplitude_slider_input.value = amplitude_val;
    }

    async function render_text() {
        const font_size = 60;
        // initial render
        let font = opentype.parse(await (await fetch('OpenSans-VariableFont_wdth,wght.ttf')).arrayBuffer())

        // adjust canvas size to fit text
        const path = font.getPath(text_to_display, 0, font_size, font_size);
        const bbox = path.getBoundingBox();
        canvas.canvas.width = bbox.x2 - bbox.x1 + 20;
        canvas.canvas.height = bbox.y2 - bbox.y1 + 20;

        // render!
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        font.draw(canvas, text_to_display, -bbox.x1 + 10, font_size - bbox.y1 + 10, font_size);

        // distort
        if (amplitude_val == 0 || animation_style === 'none') return;

        const { width, height } = canvas.canvas;

        console.log(width, height);

        let existing = canvas.getImageData(0, 0, width, height);
        let distorted = canvas.createImageData(width, height);

        let up_lim;
        let other_dimension;
        if (direction === 'left-right') {
            up_lim = canvas.canvas.width;
            other_dimension = canvas.canvas.height;
        } else {
            up_lim = canvas.canvas.height;
            other_dimension = canvas.canvas.width;
        }

        for (let i = 0; i < up_lim; i++) {
            let move_amount;
            switch (animation_style) {
                case 'sine':
                    move_amount = amplitude_val * Math.sin(i / 10) * Math.PI * 2;
                    break;
                case 'cosine':
                    move_amount = amplitude_val * Math.cos(i / 10) * Math.PI * 2;
                    break;
                default:
                    move_amount = 0;
            }

            move_amount = Math.round(move_amount);
            if (move_amount === 0) continue;

            for (let v = 0; v < other_dimension; v++) {
                
                const newV = v + move_amount;
                let srcIdx;
                let dstIdx;

                if (direction === 'left-right') {
                    srcIdx = (v * width + i) * 4;
                    dstIdx = (newV * width + i) * 4;
                    
                } else {
                    srcIdx = (i * width + v) * 4;
                    dstIdx = (i * width + newV) * 4;
                }

                for (let offset = 0; offset < 4; offset++) {
                    distorted.data[dstIdx + offset] = existing.data[srcIdx + offset];
                }
            }
        }

        canvas.putImageData(distorted, 0, 0);
    }

    text_to_display_input.value = text_to_display;

    render_text();
    update_amplitude_values();

    animation_style_box.addEventListener("change", (event) => {
        const new_value = event.target.id;
        animation_style = new_value;

        amplitude_box.hidden = (new_value === 'none');

        render_text();
    });

    amplitude_box.addEventListener("change", (event) => {
        let new_value = event.target.value;
        if (new_value > 20) {
            new_value = 20;
        } else if (new_value < 0) {
            new_value = 0;
        }
        amplitude_val = new_value;
        update_amplitude_values();
        render_text();
    });

    text_to_display_input.addEventListener('change', (event) => {
        text_to_display = event.target.value;
        render_text();
    })

    animation_direction.addEventListener('change', (event) => {
        direction = event.target.id;
        console.log(direction);
    })
});