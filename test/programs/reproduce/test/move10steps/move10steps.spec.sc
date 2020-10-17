program Move10StepsSpec

actor CatObserver is Observer begin

    declare catX as int
    declare prevX as int
    declare cat as actor

    define checkBehaviorSatisfied () begin
        define catX as calcX()
        if catX < prevX then begin
            _RUNTIME_signalFailure("cat not moving right")
        end
    end

    define calcX () begin
        define catX as cast (attribute "x" of cat) to int
    end returns catX : int

    define  storeRelevantStateInfosForNext () begin
        define prevX as catX
    end

    script on bootstrap finished do begin
        define cat as locate actor "cat"
        define prevX as calcX()

        checkBehaviorSatisfied()
        storeRelevantStateInfosForNext()
    end

    script on statement finished do begin
        checkBehaviorSatisfied()
        storeRelevantStateInfosForNext()
    end

end

