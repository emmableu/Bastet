program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare s as string
        declare n as int

        define n as 42
        define s as cast n to string

        if s = "42" then begin
            _RUNTIME_signalFailure()
        end
    end

end
