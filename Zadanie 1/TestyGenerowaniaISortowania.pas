program TestyGenerowaniaISortowania;

type
  Tablica = array of integer;

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

{ Procedura testująca poprawne losowanie }
procedure Test1;
var
  t: Tablica;
  i: integer;
  ok: boolean;
begin
  Generuj(t, 0, 100, 50);
  ok := (length(t) = 50);

  for i := 0 to length(t) - 1 do
    if (t[i] < 0) or (t[i] > 100) then
      ok := false;

  if ok then writeln('Test1 OK')
  else writeln('Test1 FAIL');
end;

{ Procedura testująca walidację elementów }
procedure Test2;
var
  t: Tablica;
begin
  Generuj(t, 10, 5, 10);
  if length(t) = 0 then writeln('Test2 OK')
  else writeln('Test2 FAIL');
end;

{ Walidacja parametru ile }
procedure Test3;
var
  t: Tablica;
begin
  Generuj(t, 0, 10, -5);
  if length(t) = 0 then writeln('Test3 OK')
  else writeln('Test3 FAIL');
end;

{ Procedura testująca poprawne sortowanie }
procedure Test4;
var
  t: Tablica;
  i: integer;
  ok: boolean;
begin
  setlength(t, 5);
  t[0] := 5; t[1] := 3; t[2] := 4; t[3] := 1; t[4] := 2;

  Sortuj(t);

  ok := true;
  for i := 0 to length(t) - 2 do
    if t[i] > t[i + 1] then
      ok := false;

  if ok then writeln('Test4 OK')
  else writeln('Test4 FAIL');
end;

{ Próba sortowania pustej tablicy }
procedure Test5;
var
  t: Tablica;
begin
  setlength(t, 0);
  Sortuj(t);

  if length(t) = 0 then writeln('Test5 OK')
  else writeln('Test5 FAIL');
end;

begin
  Test1;
  Test2;
  Test3;
  Test4;
  Test5;
end.