import opentype from 'opentype.js';
import '98.css';
import './menubar98.css'

let amplitude_val = 0;
let shift_val = 0;
let direction = 'down-up';
let text_to_display = "sus";
let animation_style = 'none';
let play_animation = false;
let play_speed = 0.1;
let current_font_used;
let uploaded_fonts = {};

window.addEventListener('DOMContentLoaded', () => {
    // DOMS
    const animation_style_box = document.getElementById('animation-style');
    const animation_direction = document.getElementById('animation-direction');

    const amplitude_box = document.getElementById('amplitude');
    const amplitude_num_input = document.querySelector('#amplitude #range-num');
    const amplitude_slider_input = document.querySelector('#amplitude #range-slider');

    const shift_box = document.getElementById('shift');
    const shift_num_input = document.querySelector('#shift #range-num');
    const shift_slider_input = document.querySelector('#shift #range-slider');

    const play_speed_box = document.getElementById('play-speed');
    const play_speed_num_input = document.querySelector('#play-speed #range-num');
    const play_speed_slider_input = document.querySelector('#play-speed #range-slider');

    const text_to_display_input = document.getElementById('display-text');
    /** @type {CanvasRenderingContext2D} */
    const canvas = document.getElementById('draw-canvas').getContext('2d');

    const play_btn = document.getElementById('play');

    /** @type {HTMLInputElement} */
    const file_drop = document.getElementById('file-drop');
    const upload_file_btn = document.getElementById('upload-file');

    const font_selection = document.getElementById('font-selection');

    const spawn_upload_window_btn = document.getElementById('show-upload-font-window');
    const upload_font_window = document.getElementById('upload-font-window');
    const close_upload_window = document.getElementById('close-upload-window');
    
    // sync values
    function update_amplitude_values() {
        amplitude_num_input.value = amplitude_val;
        amplitude_slider_input.value = amplitude_val;
    }

    function update_shift_values() {
        shift_num_input.value = shift_val;
        shift_slider_input.value = shift_val;
    }

    function update_play_speed() {
        play_speed_num_input.value = play_speed;
        play_speed_slider_input.value = play_speed;
    }

    // listeners
    close_upload_window.addEventListener('click', () => {
        upload_font_window.hidden = true;
    })

    spawn_upload_window_btn.addEventListener('click', () => {
        upload_font_window.hidden = false;
        document.activeElement?.blur && document.activeElement.blur();
    });

    upload_file_btn.addEventListener('click', () => {
        for (const file of file_drop.files) {
            uploaded_fonts[file.name] = URL.createObjectURL(file);
            let new_option = document.createElement('option');
            new_option.value = file.name;
            new_option.innerText = file.name;

            font_selection.appendChild(new_option);
        }

        file_drop.value = null;
        upload_file_btn.disabled = true;
    });

    file_drop.addEventListener('input', () => {
        upload_file_btn.disabled = (file_drop.files.length == 0);
    });

    font_selection.addEventListener('input', (event) => {
        current_font_used = uploaded_fonts[event.target.value];
        render_text();
    })

    animation_style_box.addEventListener('input', (event) => {
        const new_value = event.target.id;
        animation_style = new_value;

        amplitude_box.hidden = (new_value === 'none');
        animation_direction.hidden = (new_value === 'none');
        shift_box.hidden = (new_value === 'none' || new_value === 'random');

        render_text();
    });

    shift_box.addEventListener('input', (event) => {
        let new_value = event.target.value;
        if (new_value > 19) {
            new_value = 19;
        } else if (new_value < 0) {
            new_value = 0;
        }

        shift_val = new_value;
        update_shift_values();
        render_text();
    });

    amplitude_box.addEventListener('input', (event) => {
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

    play_speed_box.addEventListener('input', (event) => {
        let new_value = event.target.value;
        console.log(new_value);
        if (new_value > 5) {
            new_value = 5;
        } else if (new_value < 0) {
            new_value = 0;
        }
        play_speed = new_value;
        update_play_speed();
        render_text();
    });

    text_to_display_input.addEventListener('input', (event) => {
        text_to_display = event.target.value;
        render_text();
    })

    animation_direction.addEventListener('input', (event) => {
        direction = event.target.id;
        render_text();
    })

    play_btn.addEventListener('click', async () => {
        play_animation = !play_animation;
        play_btn.innerText = play_animation ? "Stop" : "Play"
        
        while (play_animation) {
            await new Promise(resolve => setTimeout(resolve, play_speed * 1000));
            shift_val = (shift_val + 1) % 20;
            update_shift_values();
            render_text();
        }
    })

    // main functionality
    async function render_text() {
        const font_size = 60;
        // initial render
        let font;
        if (current_font_used) {
            font = await fetch(current_font_used);
        } else {
            font = await fetch('OpenSans-VariableFont_wdth,wght.ttf');
        }

        font = opentype.parse(await font.arrayBuffer());

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
                    move_amount = Math.sin(i / 10 + shift_val * Math.PI / 10) * Math.PI * 2;
                    break;
                case 'cosine':
                    move_amount = Math.cos(i / 10 + shift_val * Math.PI / 10) * Math.PI * 2;
                    break;
                case 'random':
                    move_amount = Math.random() * 2 - 1;
                    break;
                default:
                    move_amount = 0;
            }

            move_amount *= amplitude_val;
            move_amount = Math.round(move_amount);

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

    // on init
    text_to_display_input.value = text_to_display;
    render_text();
    update_amplitude_values();
    update_shift_values();
    update_play_speed();
});