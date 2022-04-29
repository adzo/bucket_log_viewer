// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

headers = "BucketOwner,Bucket,Time,RemoteIP,Requester,RequestId,Operation,Key,Request-URI,HttpStatus,ErrorCode,BytesSent,ObjectSize,TotalTime,Turn-AroundTime,Referrer,User-Agent,VersionId".split(',');
objects = [{}]
var select_file_btn = document.querySelector("#select_file_btn");
var log_file_input = document.querySelector("#log_file_input");
var result_table = document.querySelector("#result_table");
var file_name = document.querySelector("#file_name")
var bucket_name = document.querySelector("#bucket-name")
var bucket_name_container = document.querySelector("#bucket-names")

select_file_btn.addEventListener("click", () => {
    log_file_input.click();
});

log_file_input.addEventListener("change", async (event) => {
    await processFiles(event.target.files)
});



async function processFiles(inputFiles) {
    if (!inputFiles && inputFiles.length == 0) {
        file_name.textContent = "| No file selected!"
        return;
    }

    let fileNames = [];

    let filesReaderResult = Array.from(inputFiles).map(file => {

        fileNames.push(file.name);

        // Define a new file reader
        let reader = new FileReader();

        // Create a new promise
        return new Promise(resolve => {

            // Resolve the promise after reading file
            reader.onload = () => resolve(reader.result);

            // Read the file as a text
            reader.readAsText(file);

        });

    });

    let objects = [];

    filesContents = await Promise.all(filesReaderResult);

    fileDecription = fileNames.join(' | ');

    if (fileDecription && fileDecription.length > 150) {
        fileDecription = fileDecription.substring(0, 150) + "...";
    }

    if (fileNames.length > 1) {
        fileDecription = `${fileNames.length} files | ${fileDecription}`;
    } else {
        fileDecription = '| ' + fileDecription;
    }

    file_name.textContent = fileDecription;

    filesContents.forEach(fileContent => {
        objectsFromFileContent = extractObjectsFromFileContent(fileContent);
        if (objectsFromFileContent && objectsFromFileContent.length > 0) {
            objectsFromFileContent.forEach(obj => objects.push(obj))
        }
    });

    //setup the datatable
    setupUI(objects);
}

function buildColumnsArray(includeBucketColumn) {
    columns = [
        {
            title: 'Request Id',
            data: 'RequestId',
            className: "px-6 py-1 text-sm text-center text-gray-500 hover:bg-gray-100",
            render: function (data, type, row) {

                return ' <span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">' + data + '</span> '
            }
        },
        { title: 'Time (UTC)', data: 'Time', className: "px-6 py-2 text-sm text-center text-gray-500", width: "200px" },
        {
            title: 'IP',
            data: 'RemoteIP',
            className: "px-6 py-2 text-sm text-center text-gray-500",
            render: function (data, type, row) {
                return '<span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">' + data + '</span>'
            }
        },


        { title: 'Operation', data: 'Operation', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Request-URI', data: 'Request-URI', className: "px-6 py-2 text-sm text-center text-gray-500" },
        {
            title: 'Http Status',
            data: 'HttpStatus',
            className: "px-6 py-2 text-sm text-center text-gray-500",
            render: function (data, type, row) {
                if (data.startsWith('2')) {
                    return '<span class="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">' + data + '</span>'
                }
                else if (data.startsWith('3')) {
                    return '<span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"">' + data + '</span>'
                } else if (data.startsWith('4')) {
                    return '<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">' + data + '</span>'
                } else {
                    return '<span class="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">' + data + '</span>';
                }
            }
        },
        {
            title: 'Error',
            data: 'ErrorCode',
            className: "px-6 py-2 text-sm text-center text-gray-500"
        },
        { title: 'Bytes Sent', data: 'BytesSent', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Size (bytes)', data: 'ObjectSize', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Total Time (ms)', data: 'TotalTime', className: "px-6 py-2 text-sm text-center text-gray-500", width: "75px" },
        { title: 'Turnaround (ms)', data: 'Turn-AroundTime', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Referrer', data: 'Referrer', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Key', data: 'Key', className: "px-6 py-2 text-sm text-center text-gray-500" },
        { title: 'Version Id', data: 'VersionId', className: "px-6 py-2 text-sm text-center text-gray-500", width: "250px" },
        { title: 'Requester', data: 'Requester', className: "px-6 py-2 text-sm text-center text-gray-500", width: "50px" },
    ];

    if (includeBucketColumn) {
        columns.push(
            {
                title: 'Bucket',
                data: 'Bucket',
                className: "px-6 py-2 text-sm text-center text-gray-500",
                width: "200px",
                render: function (data, type, row) {
                    return ' <span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">' + data + '</span> '
                }
            });
    }

    return columns;
}

function setupUI(datasource) {
    includeBucketColumn = setupBucketsDescription(datasource);

    if ($.fn.dataTable.isDataTable('#result_table')) {
        $('#result_table').DataTable().destroy();
    }

    let datatableColumns = buildColumnsArray(includeBucketColumn);

    $('#result_table').DataTable({
        data: datasource,
        columns: datatableColumns,
        "scrollX": true,
        "scrollY": 650
    });
}

function setupBucketsDescription(datasource) {
    let buckets = [];
    datasource.forEach(element => {
        if (!buckets.includes(element.Bucket)) {
            buckets.push(element.Bucket)
        }
    });

    if (buckets.length == 1) {
        bucket_name.textContent = buckets[0];
    } else {
        bucket_name.textContent = "multiple buckets detected"
    }

    return buckets.length > 1
}

function extractObjectsFromFileContent(fileContent) {
    var lines = fileContent.split('\n')
    objects = [];
    for (var i = 0, len = lines.length; i < len - 1; i++) {
        // here words[i] is the array element
        if (i > 1) {
            // result += formatLineToCsv(lines[i]) 
            objects.push(formatLineToCsv(lines[i]))
        }
    }
    return objects;
}

function process_log(input) {
    var lines = input.split('\n')
    objects = convertRawtextToCsv(lines);

    let bucket = '';
    objects.forEach(element => {
        if (bucket != element.Bucket) {
            bucket = element.Bucket;
        }
    });
    bucket_name.textContent = bucket;

    if ($.fn.dataTable.isDataTable('#result_table')) {
        $('#result_table').DataTable().destroy();
    }

    $('#result_table').DataTable({
        data: objects,
        columns: [
            {
                title: 'Request Id',
                data: 'RequestId',
                className: "px-6 py-1 text-sm text-center text-gray-500 hover:bg-gray-100",
                render: function (data, type, row) {

                    return ' <span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">' + data + '</span> '
                }
            },
            { title: 'Time (UTC)', data: 'Time', className: "px-6 py-2 text-sm text-center text-gray-500", width: "200px" },
            {
                title: 'IP',
                data: 'RemoteIP',
                className: "px-6 py-2 text-sm text-center text-gray-500",
                render: function (data, type, row) {
                    return '<span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">' + data + '</span>'
                }
            },


            { title: 'Operation', data: 'Operation', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Request-URI', data: 'Request-URI', className: "px-6 py-2 text-sm text-center text-gray-500" },
            {
                title: 'Http Status',
                data: 'HttpStatus',
                className: "px-6 py-2 text-sm text-center text-gray-500",
                render: function (data, type, row) {
                    if (data.startsWith('2')) {
                        return '<span class="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">' + data + '</span>'
                    }
                    else if (data.startsWith('3')) {
                        return '<span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300"">' + data + '</span>'
                    } else if (data.startsWith('4')) {
                        return '<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">' + data + '</span>'
                    } else {
                        return '<span class="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">' + data + '</span>';
                    }
                }
            },
            {
                title: 'Error',
                data: 'ErrorCode',
                className: "px-6 py-2 text-sm text-center text-gray-500"
            },
            { title: 'Bytes Sent', data: 'BytesSent', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Size (bytes)', data: 'ObjectSize', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Total Time (ms)', data: 'TotalTime', className: "px-6 py-2 text-sm text-center text-gray-500", width: "75px" },
            { title: 'Turnaround (ms)', data: 'Turn-AroundTime', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Referrer', data: 'Referrer', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Key', data: 'Key', className: "px-6 py-2 text-sm text-center text-gray-500" },
            { title: 'Version Id', data: 'VersionId', className: "px-6 py-2 text-sm text-center text-gray-500", width: "250px" },
            { title: 'Requester', data: 'Requester', className: "px-6 py-2 text-sm text-center text-gray-500", width: "50px" },
            //{ title: 'Bucket', data: 'Bucket', className: "px-6 py-2 text-sm text-center text-gray-500", width: "150px" }
        ],
        "scrollX": true,
        "scrollY": 650
    });
}


function formatLineToCsv(line) {
    let obj = {};
    let result = ''
    let j = 0;
    let inside_quote = false
    const delimiters = ['"', '[', ']']
    for (var i = 0; i <= line.length; i++) {
        if (i == line.length && result != '') {
            obj[headers[j]] = result;
        }
        else {
            character = line.charAt(i);
            if (!delimiters.includes(character) && character != ' ') {
                result += character
            }
            else {
                if (delimiters.includes(character)) {
                    inside_quote = !inside_quote;
                    // if (character == '"') {
                    //     result += character
                    // }
                }
                else if (character == ' ') {
                    if (inside_quote) {
                        result += ' '
                    } else {
                        //result += ','
                        obj[headers[j]] = result;
                        j++;
                        result = "";
                    }
                }
            }
        }

    }
    try {
        obj['Time'] = buildDate(obj['Time']).toISOString("YYYY-MM-dd-hh-mm-ss")
    } catch {

    }

    return obj
}

function buildDate(input) {
    var months = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    if (!input) {
        return input;
    }

    let day = input.substring(0, 2)
    let month = input.substring(3, 6)
    let year = input.substring(7, 11)
    let hour = input.substring(12, 14)
    let minute = input.substring(15, 17)
    let seconds = input.substring(18, 20)

    let result = new Date(Date.UTC(year, months[month.toLowerCase()], day, hour, minute, seconds));
    return result;
}

