program CatMoveSpec

actor CatObserver is Observer begin

    declare catX as int
    declare startX as int
    declare cat as actor
    declare game_start_time as int


    define atomic checkBehaviorSatisfied () begin
        define catX as cast attribute "x" of cat to int

        if catX > startX then begin
            _RUNTIME_signalFailure("cat is moving right")
        end

    end

    script on bootstrap finished do begin
        define cat as locate actor "Cat"
        define startX as cast attribute "x" of cat to int
        define game_start_time as _RUNTIME_micros()
        checkBehaviorSatisfied()
    end

    script on statement finished do begin
        checkBehaviorSatisfied()
    end

end

