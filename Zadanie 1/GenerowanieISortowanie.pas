program GenerowanieISortowanie;

type
  Tablica = array of integer;

var
  liczby: Tablica;

{ Procedura generująca losowe liczby }
procedure Generuj(var t: Tablica; od_, do_, ile: Integer);
var
  i: integer;
begin
  if (od_ > do_) or (ile < 0) then
  begin
    setlength(t, 0);
    exit;
  end;
  randomize;
  setlength(t, ile);
  for i := 0 to ile - 1 do
    t[i] := od_ + random(do_ - od_ + 1);
end;

{ Procedura sortująca }
procedure Sortuj(var t: Tablica);
var
  i, j, temp: integer;
begin
  for i := 0 to length(t) - 2 do
    for j := 0 to length(t) - 2 - i do
      if t[j] > t[j + 1] then
      begin
        temp := t[j];
        t[j] := t[j + 1];
        t[j + 1] := temp;
      end;
end;

{ Procedura wypisująca tablicę }
procedure Wypisz(t: Tablica);
var
  i: integer;
begin
  for i := 0 to length(t) - 1 do
    write(t[i], ' ');
  writeln;
end;

begin
  Generuj(liczby, 10, 50, 20);
  writeln('Wylosowane liczby:');
  Wypisz(liczby);

  Sortuj(liczby);
  writeln('Po sortowaniu:');
  Wypisz(liczby);
end.