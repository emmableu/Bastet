program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare alpha as number
        define alpha as 35

        declare result as number
        define result as mathSin(rad)

        if result > 0 or result < (0-0.991)  then begin
            _RUNTIME_signalFailure()
        end
    end

end

