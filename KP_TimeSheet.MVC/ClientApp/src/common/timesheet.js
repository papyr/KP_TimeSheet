
const timeSheet = (function () {

    function timeSheet_Row(id, parentId, title, type, uid, values) {
        this.id = id;
        this.parentId = parentId;
        this.title = title;
        this.type = type;
        this.uid = uid;
        this.UID = uid;
        this.uuiidd = uid;
        this.values = values;
    }

    function timeSheet_Time(date, persianDate, persianDay, projects) {
        this.date = date;
        this.persianDate = persianDate;
        this.persianDay = persianDay;
        this.projects = projects;
    }
    timeSheet_Time.prototype.calcTime = function () {
        var sum = 0;
        for (var i = 0; i < this.projects.length; i++) {
            sum += this.projects[i].calcTime();
        }
        return sum;
    }


    function timeSheet_Prject(id, title, workouts) {
        this.id = id;
        this.title = title;
        this.workouts = workouts;
    }
    timeSheet_Prject.prototype.calcTime = function () {
        var sum = 0;
        for (var i = 0; i < this.workouts.length; i++) {
            sum += this.workouts[i].hours;
        }
        return sum;
    }


    function timeSheet_Workout(id, title, hours, state) {
        this.id = id;
        this.title = title;
        this.hours = hours;
        this.state = state;
    }

    function convertNumberToTime(number) {
        if (!number) return '0:00';
        const hour = parseInt(number);
        const minut = Math.round((number - hour) * 60);
        return `${hour}:${minut > 9 ? minut : '0' + minut}`;
    }

    function convertServerDataToTimeSheet_baseInfo(response, createItemForWantApprove) {
        const data = [];

        const hozoor = new timeSheet_Row(1, null, "حضور", "-", "eb96abcb-d37d-4aa1-1001-e1f4a753bee5", []);
        data.push(hozoor);

        const karkard = new timeSheet_Row(2, null, "کارکرد", "-", "eb96abcb-d37d-4aa1-1002-e1f4a753bee5", []);
        data.push(karkard);

        const projects = [];
        const times = private_findTimesAndProjects(response, hozoor, karkard, projects, null);

        private_addDailyTimes(data, times, projects, 2);

        if (!createItemForWantApprove) return data;

        debugger;

        const taeedNashodeId = data.length + 1
        const karkard_notApprove = new timeSheet_Row(taeedNashodeId, null, "تایید نشده", "-", "eb96abcb-d37d-1001-0000-e1f4a753bee5", []);
        data.push(karkard_notApprove);

        const projects_notApprove = [];
        const times_notApprove = private_findTimesAndProjects(response, null, karkard_notApprove, projects_notApprove, "TaskNotApprove");

        private_addDailyTimes(data, times_notApprove, projects_notApprove, taeedNashodeId, true);

        return data;
    }

    function private_addDailyTimes(data, times, projects, parentId, isApprove) {

        const rowProjects = [];
        for (var i = 0; i < projects.length; i++) {
            const proj = projects[i];
            const pId = data.length + 1;
            var p = new timeSheet_Row(pId, parentId, proj.title, "Project", proj.id, []);
            data.push(p);
            rowProjects.push(p);

            p.workouts = [];

            for (var j = 0; j < proj.workouts.length; j++) {
                const workout = proj.workouts[j];
                var w = new timeSheet_Row(data.length + 1, pId, workout.title, isApprove ? workout.state : "Workout", workout.id, []);
                data.push(w);
                p.workouts.push(w)
            }
        }

        times.forEach(t => {

            rowProjects.forEach(r => {

                var i = t.projects.findIndex(p => r.uid == p.id);

                var newItem = {
                    date: t.date,
                    persianDate: t.persianDate,
                    title: t.persianDate,
                    value: convertNumberToTime(0)
                };
                r.workouts.forEach(w => {
                    const newItemForW = { ...newItem };
                    w.values.push(newItemForW);

                    if (i > -1) {
                        var wwIndex = t.projects[i].workouts.findIndex(ww => ww.id == w.uid);
                        if (wwIndex > -1) newItemForW.value = convertNumberToTime(t.projects[i].workouts[wwIndex].hours);
                    }

                })

                if (i > -1) {
                    newItem.value = convertNumberToTime(t.projects[i].calcTime());
                }

                r.values.push(newItem);

            });
        });
    }



    function private_findTimesAndProjects(response, hozoor, karkard, projects, wantedState) {

        const times = [];

        for (let i = 0; i < response.length; i++) {
            const dbTime = response[i];
            const cTime = new timeSheet_Time(dbTime.date, dbTime.date_persian, dbTime.day_persian, []);
            times.push(cTime);

            for (let j = 0; j < dbTime.projects.length; j++) {
                const dbProject = dbTime.projects[j];
                const cProject = new timeSheet_Prject(dbProject.id, dbProject.title, []);


                let pIndex = projects.findIndex(p => p.id == cProject.id);
                let savedProject;
                if (pIndex == -1) {
                    savedProject = { id: cProject.id, title: cProject.title, workouts: [] };
                    projects.push(savedProject);
                } else {
                    savedProject = projects[pIndex];
                }

                for (let k = 0; k < dbProject.workouts.length; k++) {
                    const dbWorkout = dbProject.workouts[k];
                    const cWorkout = new timeSheet_Workout(dbWorkout.id, dbWorkout.title, dbWorkout.hours, dbWorkout.state);

                    if (!wantedState || cWorkout.state == wantedState) {
                        cProject.workouts.push(cWorkout);
                        if (savedProject.workouts.findIndex(p => p.id == cWorkout.id) == -1) savedProject.workouts.push({ id: cWorkout.id, title: cWorkout.title, state: cWorkout.state, hours: cWorkout.hours });
                    }
                }

                if (cProject.workouts.length > 0) cTime.projects.push(cProject);

            }

            if (hozoor) hozoor.values.push({
                date: cTime.date,
                persianDate: cTime.persianDate,
                persianDay: cTime.persianDay,
                title: cTime.persianDate,
                value: convertNumberToTime(dbTime.hozoor)
            });
            karkard.values.push({
                date: cTime.date,
                persianDate: cTime.persianDate,
                persianDay: cTime.persianDay,
                title: cTime.persianDate,
                value: convertNumberToTime(cTime.calcTime())
            });
        }

        return times;
    }


    return {
        convertServerDataToTimeSheet_baseInfo: convertServerDataToTimeSheet_baseInfo
    }

})();

module.exports = {
    convertServerDataToTimeSheet_baseInfo: timeSheet.convertServerDataToTimeSheet_baseInfo
};