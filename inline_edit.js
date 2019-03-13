/****************************************************************** INLINE EDIT START ******************************************************************/

$.fn.extend({
    toggleText: function (a, b) {
        return this.text(this.text() == b ? a : b);
    }
});





var savedOrigin_cells = [];
var origin_cells = $('table tbody tr td:nth-child(10)');
// On Edit/Cancel Button click
$('#table_edit').on("click", (event) => {
    event.preventDefault();
    let cells = $("table tbody td:not('.sorting_1')");
    // Wanna cancel
    if (cells.attr('contenteditable')) {
    
        observer.disconnect();
        cells.removeAttr('contenteditable');
        cells.removeClass("focused");
        $('#save_changes').css("display", "none");
        $('.form-control, #ekptosi, #ekptUpdater').removeAttr("disabled");
        $('#csvBtn, .toggleFilters').unbind('click');
        $('ul.pagination').toggle(); // Toggle pagination
        if (Data.length >= 1) {
            $('#example').DataTable().clearPipeline().draw();
        }

        // Rebinding filtering event
        $('.toggleFilters').click(function () {
            $('table.filtertable.table.table-striped').toggle();
        })

        // Rebinding CSV export event
        $('a#csvBtn').click(function () {
            $('.btn.btn-secondary.buttons-csv.buttons-html5').click();
        });

        // Removing select inputs from product_origin cells

        for (let i = 0; i < savedOrigin_cells.length; i++) {
            origin_cells[i].removeAttribute('contenteditable');
            origin_cells[i].innerHTML = savedOrigin_cells[i];
        };


        // Wanna edit
    } else {
    savedOrigin_cells = [];
    origin_cells = $('table tbody tr td:nth-child(10)');
        
       for(i=0;i<origin_cells.length;i++){
            savedOrigin_cells.push(origin_cells[i].innerText);
        };
        console.log(savedOrigin_cells);

        observables = $('table tbody')[1];
        observer.observe(observables, config);

        cells.attr('contenteditable', 'true');
        $('ul.pagination').toggle(); // Toggle pagination
        $('#save_changes').css("display", "block"); // Display save button
        $('.form-control, #ekptosi, #ekptUpdater').attr("disabled", "true"); // Disable rows length  select button and global search input
        $('#csvBtn, .toggleFilters').unbind('click').click((e) => {
            e.preventDefault();
            e.target.blur();
            UIkit.modal.alert('Η λειτουργία που επιλέξατε δεν είναι διαθέσιμη κατά τη διάρκεια επεξεργασίας του πίνακα. Παρακαλώ πατήστε ακύρωση για να συνεχίσετε.')
        });

        // Creating select input for product_origin cells

        origin_cells.each((e) => {
            origin_cells[e].removeAttribute('contenteditable');
            origin_cells[e].innerHTML = "<select><option>a</option><option>b</option><option>c</option><option>d</option></select>";
        });
    }

    $('.fa-edit, .fa-times').toggleClass("fa-edit fa-times");
    $('#table_edit span').toggleText('Επεξεργασία', 'Ακύρωση');
    $("td:not('.sorting_1')").toggleClass("edit_border");
})

let Data = [];
$(document).on('mousedown', 'td', function () {
    let cells = $("table tbody td:not('.sorting_1')");
    if (cells.attr('contenteditable')) {
        cells.removeClass("focused");
        $(this).not('.sorting_1').addClass("focused");

        cell = $('td.edit_border.focused');

        row_id = cell.parent()[0].children[0].innerText;
        col_index = cell.index();
        let new_val;
        col_name = $('#sorting').children()[col_index].innerText;

    }
});

/********************************* Mutation Observer Start*********************************/


// Detect value change
let cell = $('td.edit_border.focused');
let observables = cell[0];
let row_id = "";
let col_index = cell.index();
let new_val;
let col_name = "";
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {

        new_val = mutation.target.data;

        // check if an element exists in array using a comparer function
        // comparer : function(currentElement)
        Array.prototype.inArray = function (comparer) {
            for (var i = 0; i < this.length; i++) {
                if (comparer(this[i])) return true;
            }
            return false;
        };

        let updateObj = () => {
            let obj = $.grep(Data, function (obj) {
                return obj.row_id === element.row_id && obj.col_name === element.col_name;
            })[0];
            let index = Data.findIndex(x => x.row_id == obj.row_id && x.col_name == obj.col_name);
            Data[index].value = new_val;
        }

        let showError = (error) => {
            cell.css("border-color", "red");
            cell.attr('uk-tooltip', `title: ${error}`);
            UIkit.tooltip(cell).show();
        }

        let removeError = () => {
            cell.removeAttr('uk-tooltip');
            cell.css("border-color", "lightgrey");
        }

        // adds an element to the array if it does not already exist using a comparer function
        Array.prototype.pushIfNotExist = function (element, comparer) {
            if (!this.inArray(comparer)) {
                this.push(element);
            } else {
                switch (col_name) {
                    case 'ΑΠΟΘΕΜΑ':
                        if (/[^0-9]/.test(new_val) === false) {
                            let num = parseInt(new_val);
                            if (num > 2147483647 || num < -2147483647) {
                                showError('Επιτρέπονται μόνο αριθμοί μεταξύ -2147483647 και 2147483647!');
                            } else {
                                removeError();
                                updateObj();
                            }
                        } else {
                            showError('Παρακαλώ εισάγετε έναν αριθμό!');
                        }
                        break;

                    case 'ΕΛΑΧΙΣΤΗ ΠΟΣ.':
                        if (/[^0-9]/.test(new_val) === false) {
                            let num = parseInt(new_val);
                            if (num > 2147483647 || num < 0) {
                                removeError();
                                showError('Επιτρέπονται μόνο αριθμοί μεταξύ 0 και 2147483647!');
                            } else {
                                removeError();
                                updateObj();
                            }
                        } else {
                            removeError();
                            showError('Παρακαλώ εισάγετε έναν αριθμό!');
                        }

                        break;

                    case "ΚΩΔΙΚΟΣ":
                        $.ajax({
                            type: "POST",
                            url: "/inline_edit.php",
                            data: {
                                "product_code": new_val
                            },
                            dataType: "json",
                            success: function (response) {
                                if (response.length > 0) {
                                    showError('Ο κωδικός υπάρχει!');
                                } else {
                                    removeError();
                                    updateObj();
                                }
                            }
                        });

                        break;

                    default:
                        updateObj();
                }

            }
        };

        var element = {
            "row_id": row_id,
            "col_name": col_name,
            "value": new_val
        };
        Data.pushIfNotExist(element, function (e) {
            return e.row_id === element.row_id && e.col_name === element.col_name;
        });

    });
});

let config = {
    characterData: true,
    subtree: true
};


/********************************* Mutation Observer End*********************************/





/***** Saving changes *****/



$('#save_changes').click(() => {
    let cells = $("table tbody td:not('.sorting_1')");

    if (Data.length >= 1) {
        $.ajax({
            type: "POST",
            url: "/inline_edit.php",
            data: {
                "data_array": Data
            },
            dataType: "json"
        });

        $('#example').DataTable().clearPipeline().draw();
        Data = [];
    }
    cells.removeAttr('contenteditable');
    cells.removeClass("focused");
    $('#table_edit span').toggleText('Επεξεργασία', 'Ακύρωση');
    $('.fa-edit, .fa-times').toggleClass("fa-edit fa-times");
    $("td:not('.sorting_1')").toggleClass("edit_border");
    $('#save_changes').css("display", "none");
    $('.form-control, #ekptosi, #ekptUpdater').removeAttr("disabled");
    $('#csvBtn, .toggleFilters').unbind('click');
    $('ul.pagination').toggle(); // Toggle pagination

    // Rebinding filtering event
    $('.toggleFilters').click(function () {
        $('table.filtertable.table.table-striped').toggle();
    })

    // Rebinding CSV export event
    $('a#csvBtn').click(function () {
        $('.btn.btn-secondary.buttons-csv.buttons-html5').click();
    });





});

/****************************************************************** INLINE EDIT END ******************************************************************/
