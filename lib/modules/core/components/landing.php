<?php

$components['form_text'] = array(
    'name' => 'Textbox',
    'description' => 'Single line text input',
    'category' => 'Forms',
    'update' => function ($val) {
        
        $label = @$val['label'];
        $name = @$val['name'];
        
        $html = "<div class='control'>";
        if ($label)
            $html .= "<label>".$label."</label>";
        $html .= "<span><input type='text' name='".$name."' /></span>";
        $html .= "</div>";
        
        $form_html = "
            <label>Label</label>
            <input name='label' value='$label'>
            <label>Name</label>
            <input name='name' value='$name'>
        ";
        
        return array(
            'html' => $html,
            'form' => $form_html,
            'value' => $val
        );
    }
);

$components['form_button'] = array(
    'name' => 'Submit button',
    'description' => 'Button to send form data',
    'category' => 'Forms',
    'update' => function ($val) {
        
        $label = @$val['label'] ?: "Submit";
        
        $html = "<div class='control'>";
        $html .= "<button>".$label."</button>";
        $html .= "</div>";
        
        $form_html = "
            <label>Label</label>
            <input name='label' value='$label'>
        ";
        return array(
            'html' => $html,
            'form' => $form_html,
            'value' => $val
        );
    }
);