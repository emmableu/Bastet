program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare alpha as number
        define alpha as 35

        declare result as number
        define result as mathAtan(alpha)

        if result > 84.290 and result < 90 then begin
        end else begin
            _RUNTIME_signalFailure()
        end
    end

end
