import opentype from 'opentype.js';
import '98.css';

let amplitude_val = 0;
let text_to_display = "sus";

window.addEventListener('load', () => {
    const animation_style_box = document.getElementById('animation-style');

    const amplitude_box = document.getElementById('amplitude');
    const amplitude_num_input = document.querySelector('#amplitude #range-num');
    const amplitude_slider_input = document.querySelector('#amplitude #range-slider');

    const text_to_display_input = document.getElementById('display-text');
    const canvas = document.getElementById('draw-canvas').getContext('2d');
    

    function update_amplitude_values() {
        amplitude_num_input.value = amplitude_val;
        amplitude_slider_input.value = amplitude_val;
    }

    function render_text() {
        fetch('OpenSans-VariableFont_wdth,wght.ttf')
            .then(res => res.arrayBuffer())
            .then(buffer => opentype.parse(buffer))
            .then(font => {
                console.log('decompressed!');
                canvas.clearRect(0, 0, 3000, 3000);
                font.draw(canvas, text_to_display, 0, 100, 60);
            })
            .catch(error => console.error(error));
    }

    update_amplitude_values();

    animation_style_box.addEventListener("change", (event) => {
        const new_value = event.target.id;

        amplitude_box.hidden = (new_value === 'none');
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
    });

    text_to_display_input.addEventListener('change', (event) => {
        text_to_display = event.target.value;
        render_text();
    })
});