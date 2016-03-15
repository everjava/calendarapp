Template.atgEventsCalendar.onRendered(function () {

    Session.set("monthsShowing", getMonths());
    Session.set('hoverMonth', atgEventsHelpers.getTodayDate().toISOString());

    atgEventsHelpers.positionTrayAndCalendar().then(function () {
        if (Session.get("scrollInBottom") && $("#select-dates-container .month-header").length > 2) {
            atgEventsHelpers.scrollInBottom($("#select-dates-container"));
            Session.set("scrollInBottom", false);
        }
        Tracker.afterFlush(atgEventsHelpers.adjustDayBoxHeight);
        if (Session.get("scrollInTop") && $("#select-dates-container .month-header").length > 2) {
            atgEventsHelpers.scrollInTop($("#select-dates-container"));
            Session.set("scrollInTop", false);
        }
    });

    // on finish rendered to ensure the daybox is tall enough to cater for all bubbles inside
    this.autorun(function(){

        // scroll to newly created month on DOM
        var targetMonth = Session.get("targetMonth");
        if (!targetMonth) { return ;}
        Tracker.afterFlush( function () {
            var targetDiv = $('#' + moment(targetMonth).unix());
            if (targetDiv.length == 0 ) {return ;}
            scrollVertical(targetDiv);
            Session.set("hoverMonth", targetMonth);
        });
    })

});

Template.atgEventsCalendar.helpers({
    months : function () {
        return Session.get("monthsShowing");
    },
    startDateSelected : function () {
        return Session.get("startDate");
    },
    getShortMonth : function () {
        return moment(Session.get('hoverMonth')).format("MMM").toUpperCase();
    },
    getUnix : function (isoDate) {
        return moment(isoDate).unix();
    },
    firstMonthHovered : function () {
        return Session.get("hoverMonth") == atgEventsHelpers.getTodayDate().toISOString();
    },
    getActiveClass : function () {
        if (!Session.get("createEngagementMode")) {
            return "active";
        }
        return Session.get("atgEventTypeId") ? "active" : "inactive" ;
    }
});

Template.atgEventsCalendar.events({
    "click .active .add-month" : function (event) {
        event.preventDefault();
        addMonth();
    },
    "click .active .scroll-next-month" : function () {
        if (!Session.get("hoverMonth")) { return ; }
        var monthAfter = moment(Session.get("hoverMonth")).add(1, 'month').startOf('month');
        var myDiv = $('#' + monthAfter.unix());
        if (!myDiv.length) {
            addMonth();
        } else {
            scrollVertical(myDiv);
            Session.set("hoverMonth", monthAfter.toISOString());
        }
    },
    "click .active .scroll-prev-month" : function () {
        if (!Session.get("hoverMonth")) { return ; }
        var monthBefore = moment(Session.get("hoverMonth")).add(-1, 'month').startOf('month');
        var myDiv = $('#' + monthBefore.unix());

        if (!myDiv.length ) {
            // no more dates unless we are in the month after the now()
            if (Session.get("hoverMonth") != atgEventsHelpers.getTodayDate().add(1,'month').startOf('month').toISOString()) {
                return;
            }
            myDiv = $('#' + atgEventsHelpers.getTodayDate().unix());
            Session.set("hoverMonth", atgEventsHelpers.getTodayDate().toISOString());
        } else {
            Session.set("hoverMonth", monthBefore.toISOString());
        }

        scrollVertical(myDiv);
    },
    "mouseenter .hovering" : function (event) {
        Session.set("hoverMonth", this.date);
    }
});

// HELPERS 

function addMonth() {
    var last = atgEventsHelpers.GetLastMonthShowing();
    var newDate = last.add(1, 'month');
    var months = Session.get("monthsShowing")
    months.push({date : newDate.toISOString() });
    Session.set("monthsShowing", months)
    // scroll to newly created month with a reactive variable
    Session.set("targetMonth", newDate.toISOString());
}

function getMonths() {
    var now = atgEventsHelpers.getTodayDate();
    var result = [];
    result.push({date : now.toISOString()});
    for (var i = 1; i < 3; i++) {
        var newDate = now.add(1, 'month').startOf('month');
        result.push({date : newDate.toISOString()});
    };
    return result;
}


// Animations

function scrollVertical(div) {
    var calendar = $('#calendar-container');
    var topY = calendar.scrollTop() + div.offset().top - $('#weekday-navbar').height() - $('#top-bar').height();
    TweenMax.to(calendar,1, {scrollTo:{y:topY}, ease:Power4.easeOut});
}