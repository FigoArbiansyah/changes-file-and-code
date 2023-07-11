{{-- Resources/views/theme/nav.blade.php 564 --}}

{{-- new --}}
@if(Auth::User()->role == "license" )

<a target="_blank" href="{{ url('/licenses') }}"><li><i data-feather="pie-chart"></i>Member Dashboard</li></a>

@endif
