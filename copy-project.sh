# Transport My Creative-Code To Hugo 
if [[ $# -eq 0 ]] ; then
    echo 'Please give me a projects folder name like 001-pixel'
    exit 1
fi
# File / Folder exists
if [ -f "/Users/cnichte/develop-software/01-active/creative-coding/projects/$1/dist/production/index.bundle.js" ]; then
    echo "Transport And Rename '$1' Code to Hugo..."
    cp /Users/cnichte/develop-software/01-active/creative-coding/projects/$1/dist/production/index.bundle.js "/Users/cnichte/develop-software/01-active/carsten-nichte.de - static website/assets/js/cc-code/$1.js"
else
    echo "folder $1 does not exist in projects!"
fi

