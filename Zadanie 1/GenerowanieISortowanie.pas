program GenerowanieISortowanie;

const
  N = 50;

type
  Tablica = array[1..N] of integer;

var
  liczby: Tablica;

{ Procedura generująca losowe liczby }
procedure Generuj(var t: Tablica);
var
  i: integer;
begin
  randomize;
  for i := 1 to N do
    t[i] := random(101);
end;

{ Procedura sortująca }
procedure Sortuj(var t: Tablica);
var
  i, j, temp: integer;
begin
  for i := 1 to N - 1 do
    for j := 1 to N - i do
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
  for i := 1 to N do
    write(t[i], ' ');
  writeln;
end;

begin
  Generuj(liczby);
  writeln('Wylosowane liczby:');
  Wypisz(liczby);

  Sortuj(liczby);
  writeln('Po sortowaniu:');
  Wypisz(liczby);
end.