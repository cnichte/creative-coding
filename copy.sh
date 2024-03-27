# Make it executable chmod a+x /Users/cnichte/develop-software/01-active/creative-coding/copy.sh
# https://stackoverflow.com/questions/8352851/shell-how-to-call-one-shell-script-from-another-shell-script

# Transport My Creative-Code To Hugo 
if [[ $# -eq 0 ]] ; then
    echo 'Please give me a projects folder name like 001-pixel'
    exit 1
fi
# File / Folder exists
if [ -f "$1" ]; then
    echo "Transport And Rename '$1' Code to Hugo..."
    cp /Users/cnichte/develop-software/01-active/creative-coding/projects/$1/dist/production/index.bundle.js "/Users/cnichte/develop-software/01-active/carsten-nichte.de - static website/assets/js/cc-code/$1.js"
fi

