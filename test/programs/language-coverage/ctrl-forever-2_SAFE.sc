program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare x as int
        define x as 42
        repeat forever begin
            define x as x - 1
        end
        _RUNTIME_signalFailure()
    end

end

