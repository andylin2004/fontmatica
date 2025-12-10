let amplitude_val = 0;

window.addEventListener('load', () => {
    const animation_style_box = document.getElementById('animation-style');
    const amplitude_box = document.getElementById('amplitude');
    const amplitude_num_input = document.querySelector('#amplitude #range-num');
    const amplitude_slider_input = document.querySelector('#amplitude #range-slider');

    function update_amplitude_values() {
        amplitude_num_input.value = amplitude_val;
        amplitude_slider_input.value = amplitude_val;
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
    })
});